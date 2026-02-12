import { chmod, mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";
import { HOOK_EVENT_MAP, serializeToml, substituteVars } from "./utils";

const VARS: Record<string, string> = {
  "${CLAUDE_PLUGIN_ROOT}": "${extensionPath}",
};

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
      // Convert url → httpUrl
      if (server.url) geminiServer.httpUrl = server.url;
      if (server.httpUrl) geminiServer.httpUrl = server.httpUrl;
      // Add OAuth for HTTP servers
      if (server.type === "http" || server.url || server.httpUrl) {
        geminiServer.oauth = { enabled: true };
      }
      // Map X-AI-Source header
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

function convertCommandToToml(cmd: {
  description: string;
  argumentHint?: string;
  body: string;
}): string {
  let prompt = "";
  if (cmd.argumentHint) {
    prompt += `Arguments: {{args}}\n\n`;
  }
  prompt += substituteVars(cmd.body, VARS);
  return serializeToml({ description: cmd.description, prompt });
}

function mapAgentFrontmatter(agent: {
  name: string;
  description: string;
  tools?: string;
  model?: string;
  body: string;
}): string {
  const lines: string[] = ["---"];
  lines.push(`name: ${agent.name}`);
  lines.push(`description: "${agent.description.replace(/"/g, '\\"')}"`);
  lines.push("---");
  lines.push("");
  lines.push(substituteVars(agent.body, VARS));
  return lines.join("\n") + "\n";
}

function convertHooks(
  hooksRaw: string
): { converted: string; unmapped: string[] } {
  const parsed = JSON.parse(hooksRaw) as {
    hooks: Record<string, unknown[]>;
  };
  const unmapped: string[] = [];
  const newHooks: Record<string, unknown[]> = {};

  for (const [event, handlers] of Object.entries(parsed.hooks)) {
    const geminiEvent = HOOK_EVENT_MAP[event];
    if (!geminiEvent) {
      unmapped.push(event);
      continue;
    }
    // Substitute variables in the handler JSON
    const handlersJson = substituteVars(JSON.stringify(handlers), VARS);
    newHooks[geminiEvent] = JSON.parse(handlersJson);
  }

  const converted = JSON.stringify({ hooks: newHooks }, null, 2) + "\n";
  return { converted, unmapped };
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
    // 1. gemini-extension.json
    const manifest = buildGeminiManifest(plugin);
    await writeOut(
      "gemini-extension.json",
      JSON.stringify(manifest, null, 2) + "\n"
    );

    // 2. Commands → TOML
    for (const cmd of plugin.commands) {
      const tomlPath = cmd.relPath.replace(/\.md$/, ".toml");
      const toml = convertCommandToToml(cmd);
      await writeOut(tomlPath, toml);
    }

    // 3. Skills → copy 1:1
    for (const skill of plugin.skills) {
      // Copy SKILL.md
      const raw = await readFile(
        path.join(plugin.absPath, skill.relPath),
        "utf-8"
      );
      await writeOut(skill.relPath, raw);
      // Copy references
      for (const ref of skill.references) {
        const refContent = await readFile(
          path.join(plugin.absPath, ref),
          "utf-8"
        );
        await writeOut(ref, refContent);
      }
    }

    // 4. Agents → field mapping
    for (const agent of plugin.agents) {
      const converted = mapAgentFrontmatter(agent);
      await writeOut(agent.relPath, converted);
    }

    // 5. Hooks → event name mapping
    if (plugin.hooks) {
      const { converted, unmapped } = convertHooks(plugin.hooks.raw);
      await writeOut("hooks/hooks.json", converted);
      for (const event of unmapped) {
        warnings.push({
          plugin: plugin.dirName,
          message: `Unmapped hook event "${event}" — skipped`,
        });
      }
    }

    // 6. Scripts → copy with variable substitution + preserve executable bit
    for (const script of plugin.scripts) {
      const content = substituteVars(script.content, VARS);
      await writeOut(script.relPath, content);
      if (!dryRun) {
        const srcPath = path.join(plugin.absPath, script.relPath);
        const srcStat = await stat(srcPath);
        if (srcStat.mode & 0o111) {
          await chmod(path.join(extDir, script.relPath), srcStat.mode);
        }
      }
    }

    // 7. Templates → copy as-is
    for (const tmpl of plugin.templates) {
      await writeOut(tmpl.relPath, tmpl.content);
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
