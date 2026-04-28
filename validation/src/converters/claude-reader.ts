import fg from "fast-glob";
import matter from "gray-matter";
import { readFile } from "fs/promises";
import path from "path";
import type {
  ClaudePlugin,
  McpServer,
  PluginManifest,
  SkillFile,
} from "./types";

async function tryReadJson<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

async function readSkills(pluginDir: string): Promise<SkillFile[]> {
  const skillFiles = await fg("skills/*/SKILL.md", { cwd: pluginDir });
  const results: SkillFile[] = [];
  for (const relPath of skillFiles.sort()) {
    const raw = await readFile(path.join(pluginDir, relPath), "utf-8");
    const { data, content } = matter(raw);
    const skillDir = path.dirname(relPath);
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

  const skills = await readSkills(pluginDir);

  return {
    dirName: path.basename(pluginDir),
    absPath: path.resolve(pluginDir),
    manifest,
    mcp,
    skills,
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
