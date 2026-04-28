import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";

function buildGeminiManifest(plugin: ClaudePlugin): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    name: plugin.manifest.name,
  };
  if (plugin.manifest.version) manifest.version = plugin.manifest.version;
  if (plugin.manifest.description)
    manifest.description = plugin.manifest.description;

  if (plugin.mcp) {
    const mcpServers: Record<string, unknown> = {};
    for (const [name, server] of Object.entries(plugin.mcp)) {
      const geminiServer: Record<string, unknown> = {};
      if (server.url) geminiServer.httpUrl = server.url;
      if (server.httpUrl) geminiServer.httpUrl = server.httpUrl;
      if (server.type === "http" || server.url || server.httpUrl) {
        geminiServer.oauth = { enabled: true };
      }
      if (server.headers) {
        const headers = { ...server.headers };
        if (headers["X-AI-Source"]) {
          headers["X-AI-Source"] = "gemini-extension";
        }
        geminiServer.headers = headers;
      }
      mcpServers[name] = geminiServer;
    }
    manifest.mcpServers = mcpServers;
  }

  return manifest;
}

/**
 * Generate a Gemini extension from a Claude plugin.
 */
export async function writeGeminiExtension(
  plugin: ClaudePlugin,
  outputDir: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];
  const extDir = path.join(outputDir, plugin.dirName);

  async function writeOut(relPath: string, content: string) {
    const fullPath = path.join(extDir, relPath);
    filesWritten.push(path.relative(outputDir, fullPath));
    if (!dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, "utf-8");
    }
  }

  try {
    const manifest = buildGeminiManifest(plugin);
    await writeOut(
      "gemini-extension.json",
      JSON.stringify(manifest, null, 2) + "\n"
    );

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
    errors.push(`Failed to write gemini extension: ${(e as Error).message}`);
  }

  return {
    plugin: plugin.dirName,
    target: "gemini",
    success: errors.length === 0,
    filesWritten,
    warnings,
    errors,
  };
}
