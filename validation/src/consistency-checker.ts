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

  // Cursor plugins .mcp.json files
  const cursorMcpFiles = await fg("cursor-plugins/*/.mcp.json", { cwd: root });
  for (const file of cursorMcpFiles) {
    const data = (await readJsonFile(path.join(root, file))) as {
      mcpServers?: Record<string, McpServerConfig>;
    } | null;
    if (data?.mcpServers) {
      mcpConfigs.push({ file, servers: data.mcpServers });
    }
  }

  // Codex plugins .mcp.json files
  const codexMcpFiles = await fg("codex-plugins/*/.mcp.json", { cwd: root });
  for (const file of codexMcpFiles) {
    const data = (await readJsonFile(path.join(root, file))) as {
      mcpServers?: Record<string, McpServerConfig>;
    } | null;
    if (data?.mcpServers) {
      mcpConfigs.push({ file, servers: data.mcpServers });
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
    else if (config.file.includes("cursor-plugins")) platform = "cursor";
    else if (config.file.includes("gemini-extension") || config.file.includes("gemini")) platform = "gemini";
    else if (config.file.includes("codex-plugins/")) platform = "codex";

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
    cursor: "cursor-",
    gemini: "gemini-",
    codex: "codex-",
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
    ".cursor-plugin/marketplace.json",
    ...await fg("claude-plugins/*/.claude-plugin/plugin.json", { cwd: root }),
    ...await fg("gemini-extensions/*/gemini-extension.json", { cwd: root }),
    ...await fg("copilot-cowork-plugins/*/manifest.json", { cwd: root }),
    ...await fg("cursor-plugins/*/.mcp.json", { cwd: root }),
    ...await fg("cursor-plugins/*/.cursor-plugin/plugin.json", { cwd: root }),
    ...await fg("codex-plugins/*/.mcp.json", { cwd: root }),
    ...await fg("codex-plugins/*/.codex-plugin/plugin.json", { cwd: root }),
    ".agents/plugins/marketplace.json",
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

  // Check: Codex MCP placement
  const codexMcpPlacementErrors: string[] = [];
  for (const file of codexMcpFiles) {
    if (file !== "codex-plugins/miro/.mcp.json") {
      codexMcpPlacementErrors.push(`${file}: only codex-plugins/miro/.mcp.json should exist`);
    }
  }
  if ((await fg("codex-plugins/*/.codex-plugin/plugin.json", { cwd: root })).length > 0 &&
      !codexMcpFiles.includes("codex-plugins/miro/.mcp.json")) {
    codexMcpPlacementErrors.push("codex-plugins/miro/.mcp.json is missing");
  }

  results.push({
    check: "Codex MCP placement",
    valid: codexMcpPlacementErrors.length === 0,
    details:
      codexMcpPlacementErrors.length === 0
        ? ["Only codex-plugins/miro/.mcp.json is present"]
        : codexMcpPlacementErrors,
  });

  // Check: Codex scope is only the core miro plugin, and its skill set matches
  // the source-of-truth in claude-plugins/miro/skills/.
  const codexScopeErrors: string[] = [];
  const codexPluginManifests = await fg("codex-plugins/*/.codex-plugin/plugin.json", {
    cwd: root,
  });
  const codexPluginDirs = await fg("codex-plugins/*", {
    cwd: root,
    onlyDirectories: true,
    deep: 1,
  });
  const legacyCodexDirs = await fg("codex/*", {
    cwd: root,
    onlyDirectories: true,
    deep: 1,
  });
  const legacyCodexPluginDirs = await fg("plugins/*", {
    cwd: root,
    onlyDirectories: true,
    deep: 1,
  });
  const expectedManifest = "codex-plugins/miro/.codex-plugin/plugin.json";

  for (const dir of codexPluginDirs) {
    if (dir !== "codex-plugins/miro") {
      codexScopeErrors.push(`${dir}: only codex-plugins/miro should exist in Codex output`);
    }
  }

  for (const dir of legacyCodexDirs) {
    codexScopeErrors.push(`${dir}: legacy Codex output must not remain under codex/`);
  }

  for (const dir of legacyCodexPluginDirs) {
    codexScopeErrors.push(`${dir}: legacy Codex output must not remain under plugins/`);
  }

  for (const file of codexPluginManifests) {
    if (file !== expectedManifest) {
      codexScopeErrors.push(`${file}: only codex-plugins/miro/.codex-plugin/plugin.json should exist`);
    }
  }

  if (codexPluginManifests.length > 0 && !codexPluginManifests.includes(expectedManifest)) {
    codexScopeErrors.push(`${expectedManifest} is missing`);
  }

  const codexCommands = await fg("codex-plugins/*/commands/*.md", { cwd: root });
  for (const file of codexCommands) {
    codexScopeErrors.push(`${file}: Codex output must not include command docs`);
  }

  const codexHooks = await fg("codex-plugins/*/hooks.json", { cwd: root });
  for (const file of codexHooks) {
    codexScopeErrors.push(`${file}: Codex output must not include hooks`);
  }

  const codexScripts = await fg("codex-plugins/*/scripts/*", { cwd: root });
  for (const file of codexScripts) {
    codexScopeErrors.push(`${file}: Codex output must not include generated scripts`);
  }

  // Derive the expected skill set from the source-of-truth, so adding or
  // removing a skill in claude-plugins/miro/skills/ flows through automatically.
  const sourceSkillDirs = await fg("claude-plugins/miro/skills/*", {
    cwd: root,
    onlyDirectories: true,
    deep: 1,
  });
  const expectedMiroSkills = sourceSkillDirs.map((dir) => path.basename(dir)).sort();

  for (const skillName of expectedMiroSkills) {
    const skillPath = `codex-plugins/miro/skills/${skillName}/SKILL.md`;
    if ((await fg(skillPath, { cwd: root })).length === 0) {
      codexScopeErrors.push(`${skillPath} is missing`);
    }
  }

  const codexMiroSkillDirs = await fg("codex-plugins/miro/skills/*", {
    cwd: root,
    onlyDirectories: true,
    deep: 1,
  });
  for (const dir of codexMiroSkillDirs) {
    const skillName = path.basename(dir);
    if (!expectedMiroSkills.includes(skillName)) {
      codexScopeErrors.push(
        `${dir}: skill not present in claude-plugins/miro/skills/ (stale Codex output)`
      );
    }
  }

  const marketplaceData = (await readJsonFile(
    path.join(root, ".agents/plugins/marketplace.json")
  )) as { plugins?: Array<{ name?: string }> } | null;
  const marketplacePluginNames = marketplaceData?.plugins?.map((plugin) => plugin.name) ?? [];
  if (
    marketplacePluginNames.length > 0 &&
    (marketplacePluginNames.length !== 1 || marketplacePluginNames[0] !== "miro")
  ) {
    codexScopeErrors.push(
      `.agents/plugins/marketplace.json: expected only the "miro" Codex plugin entry, found ${marketplacePluginNames.join(", ")}`
    );
  }

  results.push({
    check: "Codex output scope",
    valid: codexScopeErrors.length === 0,
    details:
      codexScopeErrors.length === 0
        ? [
            `Codex output contains only codex-plugins/miro with skills [${expectedMiroSkills.join(", ")}] and a single marketplace entry`,
        ]
        : codexScopeErrors,
  });

  // Check: Codex generated content should not contain Claude-only remnants
  const codexTextFiles = await fg(
    [
      "codex-plugins/*/skills/*/SKILL.md",
      "codex-plugins/*/scripts/*.sh",
      "codex-plugins/*/README.md",
    ],
    { cwd: root }
  );
  const codexContentErrors: string[] = [];
  const forbiddenPatterns: Array<[string, RegExp]> = [
    ["AskUserQuestion", /\bAskUserQuestion\b/],
    ["TaskCreate", /\bTaskCreate\b/],
    ["TaskUpdate", /\bTaskUpdate\b/],
    ["Write tool", /\bWrite tool\b/],
    ["Read tool", /\bRead tool\b/],
    ["Task tool", /\bTask tool\b/],
    ["${CLAUDE_PLUGIN_ROOT}", /\$\{CLAUDE_PLUGIN_ROOT\}/],
  ];

  for (const file of codexTextFiles) {
    const content = await readFile(path.join(root, file), "utf-8");
    for (const [label, pattern] of forbiddenPatterns) {
      if (pattern.test(content)) {
        codexContentErrors.push(`${file}: contains ${label}`);
      }
    }
  }

  results.push({
    check: "Codex generated content is platform-adapted",
    valid: codexContentErrors.length === 0,
    details:
      codexContentErrors.length === 0
        ? ["No Claude-only command/tool references found in generated Codex output"]
        : codexContentErrors,
  });

  return {
    hasErrors: results.some((r) => !r.valid),
    results,
  };
}
