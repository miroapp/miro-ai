import { chmod, mkdir, readFile, rm, stat, writeFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";
import {
  CODEX_PLUGIN_CAPABILITIES,
  CODEX_PLUGIN_CATEGORIES,
  CODEX_PLUGIN_DEFAULT_PROMPTS,
  CODEX_PLUGIN_ORDER,
  CODEX_SKILL_AGENT_PROMPTS,
} from "./codex-config";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";
import { escapeYamlString, substituteVars, toDisplayName } from "./utils";

const VARS: Record<string, string> = {
  "${CLAUDE_PLUGIN_ROOT}": ".",
};

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

function applyReplacements(
  content: string,
  replacements: Array<[string | RegExp, string]>
): string {
  let result = content;

  for (const [search, replace] of replacements) {
    if (typeof search === "string") {
      result = result.replaceAll(search, replace);
    } else {
      result = result.replace(search, replace);
    }
  }

  return result;
}

function ensureSentence(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) {
    return trimmed;
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function adaptTextForCodex(content: string): string {
  let result = substituteVars(content, VARS);

  result = applyReplacements(result, [
    ["using AskUserQuestion", "by asking the user directly"],
    ["with AskUserQuestion", "by asking the user directly"],
    ["ask the user using AskUserQuestion", "ask the user directly"],
    ["ask user using AskUserQuestion", "ask the user directly"],
    ["ask the user with AskUserQuestion", "ask the user directly"],
    ["ask user with AskUserQuestion", "ask the user directly"],
    ["ask user to confirm by asking the user directly", "ask the user to confirm directly"],
    ["ask the user by asking the user directly", "ask the user directly"],
    ["ask user by asking the user directly", "ask the user directly"],
    ["ask user for URL by asking the user directly", "ask the user for the URL directly"],
    ["by asking the user directly before enabling", "before enabling"],
    ["by asking the user directly:", "directly:"],
    ["Ask User to install Miro MCP server.", "Ask the user to install the core `miro` plugin."],
    ["MUST use TaskCreate for every item discovered", "MUST create an internal checklist item for every item discovered"],
    ["MUST use TaskUpdate to mark tasks as in_progress/completed", "MUST update your internal checklist to mark items as in_progress/completed"],
    ["Use TaskCreate to create a task for EVERY item discovered. This is the only way to ensure nothing is missed.", "Create an internal checklist item for EVERY item discovered so nothing is missed."],
    ["Use TaskUpdate to mark the item's task as `in_progress`", "Update your internal checklist to mark the item's entry as `in_progress`"],
    ["Use TaskUpdate to mark the item's task as `completed`", "Update your internal checklist to mark the item's entry as `completed`"],
    ['Use TaskUpdate to mark "Get and save HTML: [title]" as `in_progress`', 'Update your internal checklist to mark "Get and save HTML: [title]" as `in_progress`'],
    ['Use TaskUpdate to mark "Get and save HTML: [title]" as `completed`', 'Update your internal checklist to mark "Get and save HTML: [title]" as `completed`'],
    ["Each screen MUST be processed by a subagent (Task tool) to avoid context bloat", "For large prototype sets, you may process each screen in a subagent to avoid context bloat"],
    ["Subagent performs 3 tasks:", "A subagent can handle 3 steps:"],
    ["using Write tool:", "by writing it to disk:"],
    ["using Write tool", "by writing files to disk"],
    ["Use Write tool to save content to file system", "Write the content to disk"],
    ["use Write tool to save content to file system", "write the content to disk"],
    ["Use the Write tool to save", "Write"],
    ["use the Write tool to save", "write"],
    ["MUST use Write tool to save", "MUST write"],
    ["MUST use the Write tool to save", "MUST write"],
    ["**MUST use Write tool** to save", "**MUST write**"],
    ["use file-writing step to save content to file system", "write the content to disk immediately"],
    ["Read current index.json, add this item to items array, Write updated index.json", "Read current index.json, add this item to the items array, then write the updated index.json"],
    ["Use Write tool for ALL file types", "Write all file types"],
    ["Never skip the Write tool step - content only in memory is lost", "Never skip the file-writing step; content only in memory is lost"],
    ["Pattern: MCP call → get content → Write tool → confirm saved", "Pattern: MCP call → get content → write file → confirm saved"],
    ["Do not skip this step.", "Do not skip the file-writing step."],
    ["TaskCreate", "internal checklist creation"],
    ["TaskUpdate", "internal checklist update"],
    ["Write tool", "file-writing step"],
    ["Read tool", "local file read step"],
    ["Task tool", "subagent"],
    ["Launch a subagent (subagent,", "Launch a subagent ("],
    ["Launch a subagent (subagent)", "Launch a subagent"],
    ["by writing files to disk", "to disk"],
    ["# Using Miro with Claude Code", "# Using Miro with Codex"],
    ["enables Claude to interact directly with Miro boards", "enables Codex to interact directly with Miro boards"],
    ["Claude Code CLI", "Codex"],
    ["Claude Code settings", "Codex plugin workspace"],
    ["Claude Code", "Codex"],
    ["Claude", "Codex"],
  ]);

  result = result.replace(
    /,\s*Write updated index\.json/g,
    ", then write the updated index.json"
  );

  return result;
}

function escapeSkillInvocationsForShell(content: string): string {
  return content.replace(/\$miro/g, "\\$miro");
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

function buildSkillAgentYaml(
  skillName: string,
  description: string,
  allowImplicitInvocation?: boolean,
  defaultPrompt?: string
): string {
  const lines: string[] = [];

  if (allowImplicitInvocation === false) {
    lines.push("policy:");
    lines.push("  allow_implicit_invocation: false");
    lines.push("");
  }

  lines.push("interface:");
  lines.push(`  display_name: "${escapeYamlString(toDisplayName(skillName))}"`);
  lines.push(`  short_description: "${escapeYamlString(description)}"`);
  const resolvedDefaultPrompt =
    defaultPrompt ??
    CODEX_SKILL_AGENT_PROMPTS[skillName] ??
    `Use $${skillName} when this task matches the skill's guidance.`;
  lines.push(`  default_prompt: "${escapeYamlString(resolvedDefaultPrompt)}"`);

  lines.push("");
  return lines.join("\n");
}

function buildGeneratedReadme(plugin: ClaudePlugin): string {
  const title = toDisplayName(plugin.dirName);
  const skills = plugin.skills.map(
    (skill) => `- \`$${plugin.dirName}:${skill.name}\``
  );

  const sections = [
    `# ${title}`,
    "",
    `Generated from \`claude-plugins/${plugin.dirName}/\` by \`bun run convert:codex\`.`,
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
      const parsed = matter(raw);
      const adaptedDescription = adaptTextForCodex(String(parsed.data.description ?? ""));
      const adaptedBody = adaptTextForCodex(parsed.content).trim();
      const skillDir = path.dirname(skill.relPath);

      await writeOut(
        skill.relPath,
        matter.stringify(adaptedBody, {
          ...parsed.data,
          description: adaptedDescription,
        })
      );
      await writeOut(
        `${skillDir}/agents/openai.yaml`,
        buildSkillAgentYaml(skill.name, adaptedDescription)
      );

      for (const ref of skill.references) {
        const refContent = await readFile(path.join(plugin.absPath, ref), "utf-8");
        await writeOut(ref, adaptTextForCodex(refContent));
      }
    }

    for (const script of plugin.scripts) {
      const content = escapeSkillInvocationsForShell(
        adaptTextForCodex(script.content)
      );

      await writeOut(script.relPath, content);

      if (!dryRun) {
        const srcPath = path.join(plugin.absPath, script.relPath);
        const srcStat = await stat(srcPath);
        if (srcStat.mode & 0o111) {
          await chmod(path.join(pluginDir, script.relPath), srcStat.mode);
        }
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
