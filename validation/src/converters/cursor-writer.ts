import { chmod, mkdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";
import { CURSOR_HOOK_EVENT_MAP, substituteVars } from "./utils";

const VARS: Record<string, string> = {
  "${CLAUDE_PLUGIN_ROOT}": ".",
};

/**
 * Build Cursor plugin.json manifest from Claude plugin manifest.
 * Drops hooks path (Cursor auto-discovers hooks/hooks.json).
 */
function buildCursorManifest(plugin: ClaudePlugin): Record<string, unknown> {
  const manifest: Record<string, unknown> = {
    name: plugin.manifest.name,
  };
  if (plugin.manifest.version) manifest.version = plugin.manifest.version;
  if (plugin.manifest.description) manifest.description = plugin.manifest.description;
  if (plugin.manifest.author) manifest.author = plugin.manifest.author;
  if (plugin.manifest.homepage) manifest.homepage = plugin.manifest.homepage;
  if (plugin.manifest.repository) manifest.repository = plugin.manifest.repository;
  if (plugin.manifest.license) manifest.license = plugin.manifest.license;
  if (plugin.manifest.keywords) manifest.keywords = plugin.manifest.keywords;
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
    // Map X-AI-Source header
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
 * Rebuild command frontmatter with "name" + "description". Drop argument-hint, allowed-tools.
 * Derive name from filename. Substitute ${CLAUDE_PLUGIN_ROOT} → "." in body.
 */
function convertCommandFrontmatter(cmd: {
  relPath: string;
  description: string;
  body: string;
}): string {
  const name = path.basename(cmd.relPath, ".md");
  const lines: string[] = ["---"];
  lines.push(`name: ${name}`);
  lines.push(`description: "${cmd.description.replace(/"/g, '\\"')}"`);
  lines.push("---");
  lines.push("");
  lines.push(substituteVars(cmd.body, VARS));
  return lines.join("\n") + "\n";
}

/**
 * Rebuild agent frontmatter with name + description only. Drop tools, model.
 * Substitute ${CLAUDE_PLUGIN_ROOT} → "." in body.
 */
function convertAgentFrontmatter(agent: {
  name: string;
  description: string;
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

/**
 * Convert Claude hooks to Cursor format:
 * - Add "version": 1 at top level
 * - Map event names via CURSOR_HOOK_EVENT_MAP (PascalCase → camelCase)
 * - Flatten handler structure: [{hooks: [{...}]}] → [{...}]
 * - Drop parseJson field
 * - Substitute ${CLAUDE_PLUGIN_ROOT} → "." in commands
 * - Remove "sh " prefix from commands (scripts are executable)
 */
function convertHooks(hooksRaw: string): {
  converted: string;
  unmapped: string[];
} {
  const parsed = JSON.parse(hooksRaw) as {
    hooks: Record<string, unknown[]>;
  };
  const unmapped: string[] = [];
  const newHooks: Record<string, unknown[]> = {};

  for (const [event, handlers] of Object.entries(parsed.hooks)) {
    const cursorEvent = CURSOR_HOOK_EVENT_MAP[event];
    if (!cursorEvent) {
      unmapped.push(event);
      continue;
    }

    // Substitute variables in the handler JSON
    const handlersJson = substituteVars(JSON.stringify(handlers), VARS);
    const parsedHandlers = JSON.parse(handlersJson) as Array<{
      hooks?: Array<Record<string, unknown>>;
      [key: string]: unknown;
    }>;

    // Flatten: [{hooks: [{type, command, ...}]}] → [{type, command, ...}]
    const flatHandlers: Record<string, unknown>[] = [];
    for (const group of parsedHandlers) {
      if (group.hooks && Array.isArray(group.hooks)) {
        for (const h of group.hooks) {
          const handler: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(h)) {
            if (k === "parseJson") continue; // Drop parseJson (Claude-only field)
            handler[k] = v;
          }
          // Remove "sh " prefix from commands (Cursor runs scripts directly)
          if (typeof handler.command === "string") {
            handler.command = (handler.command as string).replace(/^sh\s+/, "");
          }
          flatHandlers.push(handler);
        }
      }
    }

    newHooks[cursorEvent] = flatHandlers;
  }

  const converted =
    JSON.stringify({ version: 1, hooks: newHooks }, null, 2) + "\n";
  return { converted, unmapped };
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
    // 1. .cursor-plugin/plugin.json
    const manifest = buildCursorManifest(plugin);
    await writeOut(
      ".cursor-plugin/plugin.json",
      JSON.stringify(manifest, null, 2) + "\n"
    );

    // 2. .mcp.json (if plugin has MCP)
    const mcpConfig = buildCursorMcp(plugin);
    if (mcpConfig) {
      await writeOut(".mcp.json", JSON.stringify(mcpConfig, null, 2) + "\n");
    }

    // 3. Commands (with adapted frontmatter)
    for (const cmd of plugin.commands) {
      const converted = convertCommandFrontmatter(cmd);
      await writeOut(cmd.relPath, converted);
    }

    // 4. Skills — copy as-is (SKILL.md + references/)
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

    // 5. Agents (with adapted frontmatter)
    for (const agent of plugin.agents) {
      const converted = convertAgentFrontmatter(agent);
      await writeOut(agent.relPath, converted);
    }

    // 6. Hooks (with adapted format)
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

    // 7. Scripts (with variable substitution + preserve executable bit)
    for (const script of plugin.scripts) {
      const content = substituteVars(script.content, VARS);
      await writeOut(script.relPath, content);
      if (!dryRun) {
        const srcPath = path.join(plugin.absPath, script.relPath);
        const srcStat = await stat(srcPath);
        if (srcStat.mode & 0o111) {
          await chmod(path.join(pluginDir, script.relPath), srcStat.mode);
        }
      }
    }

    // 8. README (copy from Claude plugin if present)
    try {
      const readme = await readFile(
        path.join(plugin.absPath, "README.md"),
        "utf-8"
      );
      await writeOut("README.md", readme);
    } catch {
      // No README in source — skip
    }

    // 9. Warn about skipped templates
    if (plugin.templates.length > 0) {
      warnings.push({
        plugin: plugin.dirName,
        message: `${plugin.templates.length} template(s) skipped — Cursor has no template system`,
      });
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
