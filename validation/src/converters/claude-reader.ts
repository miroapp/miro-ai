import fg from "fast-glob";
import matter from "gray-matter";
import { readFile } from "fs/promises";
import path from "path";
import type {
  AgentFile,
  ClaudePlugin,
  CommandFile,
  HooksConfig,
  McpServer,
  PluginManifest,
  ScriptFile,
  SkillFile,
  TemplateFile,
} from "./types";

async function tryReadJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

async function tryReadText(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf-8");
  } catch {
    return null;
  }
}

async function readCommands(pluginDir: string): Promise<CommandFile[]> {
  const files = await fg("commands/*.md", { cwd: pluginDir });
  const results: CommandFile[] = [];
  for (const relPath of files.sort()) {
    const raw = await readFile(path.join(pluginDir, relPath), "utf-8");
    const { data, content } = matter(raw);
    results.push({
      relPath,
      description: data.description ?? "",
      argumentHint: data["argument-hint"],
      allowedTools: data["allowed-tools"],
      body: content.trim(),
    });
  }
  return results;
}

async function readSkills(pluginDir: string): Promise<SkillFile[]> {
  const skillFiles = await fg("skills/*/SKILL.md", { cwd: pluginDir });
  const results: SkillFile[] = [];
  for (const relPath of skillFiles.sort()) {
    const raw = await readFile(path.join(pluginDir, relPath), "utf-8");
    const { data, content } = matter(raw);
    const skillDir = path.dirname(relPath);
    // Find reference files
    const refFiles = await fg(`${skillDir}/references/**/*`, {
      cwd: pluginDir,
    });
    results.push({
      relPath,
      name: data.name ?? "",
      description: data.description ?? "",
      body: content.trim(),
      references: refFiles.sort(),
    });
  }
  return results;
}

async function readAgents(pluginDir: string): Promise<AgentFile[]> {
  const files = await fg("agents/*.md", { cwd: pluginDir });
  const results: AgentFile[] = [];
  for (const relPath of files.sort()) {
    const raw = await readFile(path.join(pluginDir, relPath), "utf-8");
    const { data, content } = matter(raw);
    results.push({
      relPath,
      name: data.name ?? "",
      description: data.description ?? "",
      tools: data.tools,
      model: data.model,
      body: content.trim(),
    });
  }
  return results;
}

async function readHooks(pluginDir: string): Promise<HooksConfig | null> {
  // hooks.json can be at .claude-plugin/hooks.json
  const hooksPath = path.join(pluginDir, ".claude-plugin", "hooks.json");
  const raw = await tryReadText(hooksPath);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { hooks: Record<string, unknown[]> };
    return { hooks: parsed.hooks, raw };
  } catch {
    return null;
  }
}

async function readScripts(pluginDir: string): Promise<ScriptFile[]> {
  const files = await fg("scripts/*.sh", { cwd: pluginDir });
  const results: ScriptFile[] = [];
  for (const relPath of files.sort()) {
    const content = await readFile(path.join(pluginDir, relPath), "utf-8");
    results.push({ relPath, content });
  }
  return results;
}

async function readTemplates(pluginDir: string): Promise<TemplateFile[]> {
  const files = await fg("templates/**/*", { cwd: pluginDir, dot: false });
  const results: TemplateFile[] = [];
  for (const relPath of files.sort()) {
    const content = await readFile(path.join(pluginDir, relPath), "utf-8");
    results.push({ relPath, content });
  }
  return results;
}

/**
 * Read a single Claude plugin directory into a typed structure.
 */
export async function readClaudePlugin(
  pluginDir: string
): Promise<ClaudePlugin | null> {
  const manifestPath = path.join(pluginDir, ".claude-plugin", "plugin.json");
  const manifest = await tryReadJson<PluginManifest>(manifestPath);
  if (!manifest) return null;

  const mcpPath = path.join(pluginDir, ".mcp.json");
  const mcp = await tryReadJson<Record<string, McpServer>>(mcpPath);

  const [commands, skills, agents, hooks, scripts, templates] =
    await Promise.all([
      readCommands(pluginDir),
      readSkills(pluginDir),
      readAgents(pluginDir),
      readHooks(pluginDir),
      readScripts(pluginDir),
      readTemplates(pluginDir),
    ]);

  return {
    dirName: path.basename(pluginDir),
    absPath: path.resolve(pluginDir),
    manifest,
    mcp,
    commands,
    skills,
    agents,
    hooks,
    scripts,
    templates,
  };
}

/**
 * Discover and read all Claude plugins under the given root.
 */
export async function readAllPlugins(root: string): Promise<ClaudePlugin[]> {
  const pluginDirs = await fg("claude-plugins/*/", {
    cwd: root,
    onlyDirectories: true,
  });

  const plugins: ClaudePlugin[] = [];
  for (const dir of pluginDirs.sort()) {
    const plugin = await readClaudePlugin(path.join(root, dir));
    if (plugin) plugins.push(plugin);
  }
  return plugins;
}
