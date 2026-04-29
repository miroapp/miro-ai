import { mkdir, readFile, rm, writeFile } from "fs/promises";
import path from "path";
import {
  CODEX_PLUGIN_CAPABILITIES,
  CODEX_PLUGIN_CATEGORIES,
  CODEX_PLUGIN_DEFAULT_PROMPTS,
  CODEX_PLUGIN_ORDER,
} from "./codex-config";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";
import { toDisplayName } from "./utils";

const MIRO_PRIVACY_POLICY_URL = "https://miro.com/legal/privacy-policy/";
const MIRO_TERMS_OF_SERVICE_URL = "https://miro.com/legal/terms-of-service/";

function getRepositoryUrl(
  repository: ClaudePlugin["manifest"]["repository"]
): string | undefined {
  if (!repository) {
    return undefined;
  }

  if (typeof repository === "string") {
    return repository;
  }

  return repository.url;
}

function buildCodexManifest(plugin: ClaudePlugin): Record<string, unknown> {
  const description = plugin.manifest.description ?? "";
  const homepage = plugin.manifest.homepage ?? "https://miro.com";
  const repository = getRepositoryUrl(plugin.manifest.repository);
  const author = {
    ...(plugin.manifest.author ?? { name: "Miro" }),
    url: plugin.manifest.author?.url ?? homepage,
  };
  const displayName = toDisplayName(plugin.dirName);

  const manifest: Record<string, unknown> = {
    name: plugin.manifest.name,
    version: plugin.manifest.version ?? "0.0.0",
    description,
    author,
    homepage,
    license: plugin.manifest.license ?? "MIT",
    keywords: plugin.manifest.keywords ?? [],
    interface: {
      displayName,
      shortDescription: description,
      longDescription: description,
      developerName: "Miro",
      category:
        CODEX_PLUGIN_CATEGORIES[
          plugin.dirName as keyof typeof CODEX_PLUGIN_CATEGORIES
        ] ?? "Productivity",
      capabilities:
        CODEX_PLUGIN_CAPABILITIES[
          plugin.dirName as keyof typeof CODEX_PLUGIN_CAPABILITIES
        ] ?? ["Interactive", "Write"],
      websiteURL: homepage,
      privacyPolicyURL: MIRO_PRIVACY_POLICY_URL,
      termsOfServiceURL: MIRO_TERMS_OF_SERVICE_URL,
      defaultPrompt:
        CODEX_PLUGIN_DEFAULT_PROMPTS[
          plugin.dirName as keyof typeof CODEX_PLUGIN_DEFAULT_PROMPTS
        ] ?? [],
    },
  };

  if (repository) {
    manifest.repository = repository;
  }

  if (plugin.skills.length > 0) {
    manifest.skills = "./skills/";
  }

  if (plugin.dirName === "miro") {
    manifest.mcpServers = "./.mcp.json";
  }

  return manifest;
}

function buildCodexMcp(
  plugin: ClaudePlugin
): Record<string, unknown> | null {
  if (plugin.dirName !== "miro" || !plugin.mcp) {
    return null;
  }

  const mcpServers: Record<string, unknown> = {};
  for (const [name, server] of Object.entries(plugin.mcp)) {
    const codexServer: Record<string, unknown> = {};

    if (server.type) codexServer.type = server.type;
    if (server.url) codexServer.url = server.url;
    if (server.httpUrl) codexServer.httpUrl = server.httpUrl;
    if (server.headers) {
      const headers = { ...server.headers };
      if (headers["X-AI-Source"]) {
        headers["X-AI-Source"] = "codex-plugin";
      }
      codexServer.headers = headers;
    }

    mcpServers[name] = codexServer;
  }

  return Object.keys(mcpServers).length > 0 ? { mcpServers } : null;
}

function buildGeneratedReadme(plugin: ClaudePlugin): string {
  const title = toDisplayName(plugin.dirName);
  const skills = plugin.skills.map(
    (skill) => `- \`$${plugin.dirName}:${skill.name}\``
  );

  const sections = [
    `# ${title}`,
    "",
    `Generated from \`claude-plugins/${plugin.dirName}/\` by \`bun run convert\`.`,
    "",
    "## Overview",
    "",
    plugin.manifest.description ?? "",
    "",
    "## Codex Surfaces",
    "",
    "- Plugin manifest: `.codex-plugin/plugin.json`",
    "- MCP config: `.mcp.json`",
    ...(skills.length > 0 ? ["", "Skills:", "", ...skills] : []),
  ];

  sections.push(
    "",
    "## Related",
    "",
    "- `../../README.md` - Repository overview",
    "- `../../CONTRIBUTING.md` - Local regeneration and validation workflow"
  );

  return sections.join("\n") + "\n";
}

export async function writeCodexPlugin(
  plugin: ClaudePlugin,
  outputDir: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];
  const pluginDir = path.join(outputDir, plugin.dirName);

  if (!dryRun) {
    await rm(pluginDir, { recursive: true, force: true });
  }

  async function writeOut(relPath: string, content: string) {
    const fullPath = path.join(pluginDir, relPath);
    filesWritten.push(path.relative(outputDir, fullPath));
    if (!dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, "utf-8");
    }
  }

  try {
    await writeOut(
      ".codex-plugin/plugin.json",
      JSON.stringify(buildCodexManifest(plugin), null, 2) + "\n"
    );

    const mcpConfig = buildCodexMcp(plugin);
    if (mcpConfig) {
      await writeOut(".mcp.json", JSON.stringify(mcpConfig, null, 2) + "\n");
    }

    for (const skill of plugin.skills) {
      const raw = await readFile(path.join(plugin.absPath, skill.relPath), "utf-8");
      await writeOut(skill.relPath, raw);

      for (const ref of skill.references) {
        const refContent = await readFile(path.join(plugin.absPath, ref), "utf-8");
        await writeOut(ref, refContent);
      }
    }

    await writeOut("README.md", buildGeneratedReadme(plugin));
  } catch (e) {
    errors.push(`Failed to write Codex plugin: ${(e as Error).message}`);
  }

  return {
    plugin: plugin.dirName,
    target: "codex",
    success: errors.length === 0,
    filesWritten,
    warnings,
    errors,
  };
}

export async function writeCodexMarketplace(
  plugins: ClaudePlugin[],
  root: string,
  dryRun: boolean
): Promise<{ fileWritten: string | null; errors: string[] }> {
  const marketplacePath = path.join(root, ".agents", "plugins", "marketplace.json");
  const errors: string[] = [];

  const selected = CODEX_PLUGIN_ORDER.map((pluginName) =>
    plugins.find((plugin) => plugin.dirName === pluginName)
  ).filter((plugin): plugin is ClaudePlugin => Boolean(plugin));

  const marketplace = {
    name: "miro-ai",
    interface: {
      displayName: "Miro AI",
    },
    plugins: selected.map((plugin) => ({
      name: plugin.dirName,
      source: {
        source: "local",
        path: `./codex-plugins/${plugin.dirName}`,
      },
      policy: {
        installation: "AVAILABLE",
        authentication: "ON_INSTALL",
      },
      category:
        CODEX_PLUGIN_CATEGORIES[
          plugin.dirName as keyof typeof CODEX_PLUGIN_CATEGORIES
        ] ?? "Productivity",
    })),
  };

  try {
    if (!dryRun) {
      await mkdir(path.dirname(marketplacePath), { recursive: true });
      await writeFile(
        marketplacePath,
        JSON.stringify(marketplace, null, 2) + "\n",
        "utf-8"
      );
    }
  } catch (e) {
    errors.push(`Failed to write Codex marketplace: ${(e as Error).message}`);
  }

  return {
    fileWritten: path.relative(root, marketplacePath),
    errors,
  };
}
