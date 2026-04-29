import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";
import { toDisplayName } from "./utils";

/**
 * Build Cursor plugin.json manifest from Claude plugin.
 */
function buildCursorManifest(plugin: ClaudePlugin): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    name: plugin.manifest.name,
    displayName: toDisplayName(plugin.manifest.name),
  };
  if (plugin.manifest.version) manifest.version = plugin.manifest.version;
  if (plugin.manifest.description) manifest.description = plugin.manifest.description;
  if (plugin.manifest.author) manifest.author = plugin.manifest.author;
  if (plugin.manifest.homepage) manifest.homepage = plugin.manifest.homepage;
  if (plugin.manifest.repository) manifest.repository = plugin.manifest.repository;
  if (plugin.manifest.license) manifest.license = plugin.manifest.license;
  if (plugin.manifest.keywords) manifest.keywords = plugin.manifest.keywords;

  if (plugin.skills.length > 0) manifest.skills = "./skills/";

  return manifest;
}

/**
 * Build Cursor .mcp.json: wrap in { mcpServers: {...} }, set X-AI-Source.
 */
function buildCursorMcp(plugin: ClaudePlugin): Record<string, unknown> | null {
  if (!plugin.mcp) return null;

  const mcpServers: Record<string, unknown> = {};
  for (const [name, server] of Object.entries(plugin.mcp)) {
    const cursorServer: Record<string, unknown> = {};
    if (server.url) cursorServer.url = server.url;
    if (server.httpUrl) cursorServer.url = server.httpUrl;
    if (server.headers) {
      const headers = { ...server.headers };
      if (headers["X-AI-Source"]) {
        headers["X-AI-Source"] = "cursor-plugin";
      }
      cursorServer.headers = headers;
    }
    mcpServers[name] = cursorServer;
  }

  if (Object.keys(mcpServers).length === 0) return null;
  return { mcpServers };
}

/**
 * Generate a Cursor plugin from a Claude plugin.
 */
export async function writeCursorPlugin(
  plugin: ClaudePlugin,
  outputDir: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];
  const pluginDir = path.join(outputDir, plugin.dirName);

  async function writeOut(relPath: string, content: string) {
    const fullPath = path.join(pluginDir, relPath);
    filesWritten.push(path.relative(outputDir, fullPath));
    if (!dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, "utf-8");
    }
  }

  try {
    const manifest = buildCursorManifest(plugin);
    await writeOut(
      ".cursor-plugin/plugin.json",
      JSON.stringify(manifest, null, 2) + "\n"
    );

    const mcpConfig = buildCursorMcp(plugin);
    if (mcpConfig) {
      await writeOut(".mcp.json", JSON.stringify(mcpConfig, null, 2) + "\n");
    }

    for (const skill of plugin.skills) {
      const raw = await readFile(
        path.join(plugin.absPath, skill.relPath),
        "utf-8"
      );
      await writeOut(skill.relPath, raw);
      for (const ref of skill.references) {
        const refContent = await readFile(
          path.join(plugin.absPath, ref),
          "utf-8"
        );
        await writeOut(ref, refContent);
      }
    }

    try {
      const readme = await readFile(
        path.join(plugin.absPath, "README.md"),
        "utf-8"
      );
      await writeOut("README.md", readme);
    } catch {
      // No README in source — skip
    }
  } catch (e) {
    errors.push(`Failed to write cursor plugin: ${(e as Error).message}`);
  }

  return {
    plugin: plugin.dirName,
    target: "cursor",
    success: errors.length === 0,
    filesWritten,
    warnings,
    errors,
  };
}
