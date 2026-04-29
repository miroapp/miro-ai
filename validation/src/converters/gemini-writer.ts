import { mkdir, writeFile } from "fs/promises";
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
 * Generate the Gemini extension manifest at the repo root.
 *
 * Per Gemini CLI's extension model (https://geminicli.com/docs/extensions/reference/),
 * the repo root IS the extension when users `gemini extensions install <owner/repo>`.
 * Skills bundled in `<extension-root>/skills/` are auto-discovered. Since the
 * agent-skills mirror at `skills/` already contains the source skills byte-identical
 * to source, this writer only needs to emit the manifest — no skill copying needed.
 */
export async function writeGeminiExtension(
  plugin: ClaudePlugin,
  manifestPath: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];

  try {
    const manifest = buildGeminiManifest(plugin);
    const content = JSON.stringify(manifest, null, 2) + "\n";
    filesWritten.push(path.basename(manifestPath));
    if (!dryRun) {
      await mkdir(path.dirname(manifestPath), { recursive: true });
      await writeFile(manifestPath, content, "utf-8");
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
