import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";

export interface ConsistencyResult {
  check: string;
  valid: boolean;
  details: string[];
}

export interface ConsistencyResults {
  hasErrors: boolean;
  results: ConsistencyResult[];
}

interface McpServerConfig {
  url?: string;
  httpUrl?: string;
  type?: string;
  headers?: Record<string, string>;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  try {
    const content = await readFile(filePath, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export async function checkConsistency(
  root: string
): Promise<ConsistencyResults> {
  const results: ConsistencyResult[] = [];

  // Collect all MCP server configurations
  const mcpConfigs: { file: string; servers: Record<string, McpServerConfig> }[] = [];

  // Claude .mcp.json files
  const claudeMcpFiles = await fg("claude-plugins/*/.mcp.json", { cwd: root });
  for (const file of claudeMcpFiles) {
    const data = await readJsonFile(path.join(root, file));
    if (data && typeof data === "object") {
      mcpConfigs.push({
        file,
        servers: data as Record<string, McpServerConfig>,
      });
    }
  }

  // Kiro mcp.json files
  const kiroMcpFiles = await fg("powers/*/mcp.json", { cwd: root });
  for (const file of kiroMcpFiles) {
    const data = (await readJsonFile(path.join(root, file))) as {
      mcpServers?: Record<string, McpServerConfig>;
    } | null;
    if (data?.mcpServers) {
      mcpConfigs.push({
        file,
        servers: data.mcpServers,
      });
    }
  }

  // Gemini extensions (root + generated)
  const geminiFiles = [
    "gemini-extension.json",
    ...(await fg("gemini-extensions/*/gemini-extension.json", { cwd: root })),
  ];
  for (const file of geminiFiles) {
    const geminiData = (await readJsonFile(path.join(root, file))) as {
      mcpServers?: Record<string, McpServerConfig>;
    } | null;
    if (geminiData?.mcpServers) {
      mcpConfigs.push({
        file,
        servers: geminiData.mcpServers,
      });
    }
  }

  // Check: All Miro MCP URLs should point to the same base URL
  const miroUrls: { file: string; url: string }[] = [];
  for (const config of mcpConfigs) {
    for (const [name, server] of Object.entries(config.servers)) {
      if (name.toLowerCase().includes("miro")) {
        const url = server.url || server.httpUrl;
        if (url) {
          miroUrls.push({ file: config.file, url });
        }
      }
    }
  }

  const uniqueUrls = [...new Set(miroUrls.map((u) => u.url))];
  const urlsMatch = uniqueUrls.length <= 1;
  results.push({
    check: "MCP URL consistency",
    valid: urlsMatch,
    details: urlsMatch
      ? [`All Miro MCP servers use: ${uniqueUrls[0] || "N/A"}`]
      : miroUrls.map((u) => `${u.file}: ${u.url}`),
  });

  // Check: X-AI-Source headers should identify the platform correctly
  // Same platform can share header, different platforms should be different
  const sourceHeaders: { file: string; source: string; platform: string }[] = [];
  for (const config of mcpConfigs) {
    // Determine platform from file path
    let platform = "unknown";
    if (config.file.includes("claude-plugins")) platform = "claude";
    else if (config.file.includes("powers")) platform = "kiro";
    else if (config.file.includes("gemini-extension") || config.file.includes("gemini")) platform = "gemini";

    for (const server of Object.values(config.servers)) {
      const source = server.headers?.["X-AI-Source"];
      if (source) {
        sourceHeaders.push({ file: config.file, source, platform });
      }
    }
  }

  // Group by platform and check each platform uses correct header prefix
  // kiro → "kiro-*-extension", gemini → "gemini-extension", claude → "claude-code-plugin"
  const platformPrefixes: Record<string, string> = {
    claude: "claude-",
    kiro: "kiro-",
    gemini: "gemini-",
  };
  const platformSources = new Map<string, Set<string>>();
  const badHeaders: string[] = [];

  for (const h of sourceHeaders) {
    if (!platformSources.has(h.platform)) {
      platformSources.set(h.platform, new Set());
    }
    platformSources.get(h.platform)!.add(h.source);

    const expectedPrefix = platformPrefixes[h.platform];
    if (expectedPrefix && !h.source.startsWith(expectedPrefix)) {
      badHeaders.push(
        `${h.file}: "${h.source}" does not start with "${expectedPrefix}"`
      );
    }
  }

  results.push({
    check: "X-AI-Source headers use correct platform prefix",
    valid: badHeaders.length === 0,
    details:
      badHeaders.length === 0
        ? [...platformSources.entries()].map(
            ([platform, sources]) => `${platform}: ${[...sources].join(", ")}`
          )
        : badHeaders,
  });

  // Check: JSON files are valid JSON
  const jsonFiles = [
    ...claudeMcpFiles,
    ...kiroMcpFiles,
    "gemini-extension.json",
    ".claude-plugin/marketplace.json",
    ...await fg("claude-plugins/*/.claude-plugin/plugin.json", { cwd: root }),
    ...await fg("claude-plugins/*/.claude-plugin/hooks.json", { cwd: root }),
    ...await fg("gemini-extensions/*/gemini-extension.json", { cwd: root }),
    ...await fg("gemini-extensions/*/hooks/hooks.json", { cwd: root }),
  ];

  const jsonErrors: string[] = [];
  for (const file of jsonFiles) {
    try {
      const content = await readFile(path.join(root, file), "utf-8");
      JSON.parse(content);
    } catch (e) {
      jsonErrors.push(`${file}: ${(e as Error).message}`);
    }
  }

  results.push({
    check: "JSON syntax valid",
    valid: jsonErrors.length === 0,
    details: jsonErrors.length === 0 ? ["All JSON files are valid"] : jsonErrors,
  });

  return {
    hasErrors: results.some((r) => !r.valid),
    results,
  };
}
