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

/**
 * Inline shell replacements for known scripts. Since ${extensionPath} is NOT
 * resolved in TOML command files (only in gemini-extension.json and hooks.json),
 * we inline the script logic directly using !{...} shell blocks.
 *
 * Each entry maps a script basename to its inline shell replacement.
 * - `noArgs`: replacement when the script takes no arguments
 * - `withArgs`: replacement when the script takes arguments (uses {{args}})
 */
const SCRIPT_INLINES: Record<
  string,
  { noArgs?: string; withArgs?: string }
> = {
  "command-status.sh": {
    noArgs:
      '!{if [ -f .miro/config.json ]; then cat .miro/config.json; else echo "Task tracking in Miro is disabled. Run /miro-tasks:enable <table-url> to enable it."; fi}',
  },
  "command-disable.sh": {
    noArgs:
      '!{rm -f .miro/config.json 2>/dev/null; echo "Task tracking in Miro is disabled."}',
  },
  "command-enable.sh": {
    withArgs: `!{
args="{{args}}"
if [ -n "$args" ]; then
  case "$args" in
    *moveToWidget=*|*focusWidget=*)
      mkdir -p .miro
      printf '{\\n  "tableUrl": "%s"\\n}\\n' "$args" > .miro/config.json
      echo "Enabled tracking for table $args"
      ;;
    *)
      echo "ERROR: URL must contain moveToWidget or focusWidget parameter."
      ;;
  esac
else
  echo "NO_URL_PROVIDED"
fi
}`,
  },
};

/** Fallback instructions appended after the enable !{...} block */
const ENABLE_FALLBACK = `
If the output above shows "Enabled tracking...", report success to the user and stop.
If the output shows an error about the URL, tell the user the URL needs a moveToWidget or focusWidget parameter.

Otherwise, follow these instructions to find a table URL:`;

/**
 * Regex matching script reference lines after variable substitution:
 *   "Run script ${extensionPath}/scripts/foo.sh"
 *   "1. Run script ${extensionPath}/scripts/foo.sh"
 *   "   - Runs script ${extensionPath}/scripts/foo.sh <TABLE_URL>"
 * Captures: (1) script basename  (2) trailing args or undefined
 */
const SCRIPT_REF_RE =
  /^\s*(?:\d+\.\s+|-\s+)?Runs?\s+script\s+\$\{extensionPath\}\/scripts\/(\S+\.sh)(?:\s+(.+))?$/;

/**
 * Replace script references with inline !{...} shell blocks.
 * Falls back to !{sh "${extensionPath}/scripts/..." 2>&1} for unknown scripts
 * (works when extension is installed via `link`).
 */
function inlineScriptRefs(body: string, hasArgs: boolean): string {
  const lines = body.split("\n");
  const out: string[] = [];
  let skipNext = false;

  for (let i = 0; i < lines.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    const line = lines[i];
    const m = line.match(SCRIPT_REF_RE);
    if (!m) {
      out.push(line);
      continue;
    }

    const scriptName = m[1]; // e.g. "command-status.sh"
    const trailingArgs = m[2]?.trim();
    const inline = SCRIPT_INLINES[scriptName];

    // Skip orphaned follow-up line like "   - Replace `<TABLE_URL>`..."
    if (
      trailingArgs &&
      i + 1 < lines.length &&
      /^\s*-\s+Replace\b/.test(lines[i + 1])
    ) {
      skipNext = true;
    }

    if (inline) {
      if (trailingArgs && inline.withArgs && hasArgs) {
        out.push(inline.withArgs);
        out.push(ENABLE_FALLBACK);
      } else if (!trailingArgs && inline.noArgs) {
        out.push(inline.noArgs);
      } else {
        const scriptPath = `\${extensionPath}/scripts/${scriptName}`;
        out.push(`!{sh "${scriptPath}" 2>&1}`);
      }
    } else {
      const scriptPath = `\${extensionPath}/scripts/${scriptName}`;
      const args = trailingArgs && hasArgs ? ` "{{args}}"` : "";
      out.push(`!{sh "${scriptPath}"${args} 2>&1}`);
    }
  }

  return out.join("\n");
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
  let body = substituteVars(cmd.body, VARS);
  body = inlineScriptRefs(body, !!cmd.argumentHint);
  prompt += body;
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

/** Regex to extract script filename from hook command, e.g. "sh ${extensionPath}/scripts/hooks-stop.sh" */
const HOOK_SCRIPT_RE =
  /\bsh\s+\$\{extensionPath\}\/scripts\/([^\s"]+\.sh)\b/;

function convertHooks(hooksRaw: string): {
  converted: string;
  unmapped: string[];
  /** Script basenames that need a gemini-* wrapper (e.g. "hooks-stop.sh") */
  wrapperScripts: string[];
} {
  const parsed = JSON.parse(hooksRaw) as {
    hooks: Record<string, unknown[]>;
  };
  const unmapped: string[] = [];
  const newHooks: Record<string, unknown[]> = {};
  const wrapperScripts: string[] = [];

  for (const [event, handlers] of Object.entries(parsed.hooks)) {
    const geminiEvent = HOOK_EVENT_MAP[event];
    if (!geminiEvent) {
      unmapped.push(event);
      continue;
    }
    // Substitute variables in the handler JSON
    const handlersJson = substituteVars(JSON.stringify(handlers), VARS);
    const parsedHandlers = JSON.parse(handlersJson) as Array<{
      hooks?: Array<Record<string, unknown>>;
    }>;
    // Strip Claude-specific fields and rewrite script refs to wrappers
    for (const group of parsedHandlers) {
      if (group.hooks) {
        for (const h of group.hooks) {
          delete h.parseJson;
          // Rewrite command to use gemini-* wrapper script
          if (typeof h.command === "string") {
            const m = (h.command as string).match(HOOK_SCRIPT_RE);
            if (m) {
              const scriptName = m[1];
              if (!wrapperScripts.includes(scriptName)) {
                wrapperScripts.push(scriptName);
              }
              h.command = (h.command as string).replace(
                `scripts/${scriptName}`,
                `scripts/gemini-${scriptName}`
              );
            }
          }
        }
      }
    }
    newHooks[geminiEvent] = parsedHandlers;
  }

  const converted = JSON.stringify({ hooks: newHooks }, null, 2) + "\n";
  return { converted, unmapped, wrapperScripts };
}

/**
 * Generate a Gemini hook wrapper script that adapts Claude's hook protocol
 * to Gemini CLI expectations:
 * - Sets extensionPath env var (not provided by Gemini)
 * - Outputs {"decision":"allow"} on empty stdout (Gemini expects JSON)
 * - Exits 0 when forwarding JSON decisions (Gemini: exit 1 = warning, ignored)
 */
function generateHookWrapper(scriptName: string): string {
  return `#!/bin/sh
# Gemini CLI hook wrapper — adapts Claude hook protocol to Gemini
# Generated by converter. Original script is not modified.

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Provide extensionPath env var (Gemini doesn't set it; scripts may reference it)
extensionPath="$(cd "$SCRIPT_DIR/.." && pwd)"
export extensionPath

# Run the original script, capture output and exit code
output=$("$SCRIPT_DIR/${scriptName}" 2>/dev/null)
exit_code=$?

if [ $exit_code -eq 0 ] && [ -z "$output" ]; then
  # Allow path: original outputs nothing — Gemini needs JSON
  printf '{\"decision\":\"allow\"}\\n'
  exit 0
fi

# Block/decision path: forward JSON output, exit 0
# Gemini: exit 0 = parse JSON decision, exit 1 = warning (non-fatal), exit 2 = emergency brake
printf '%s\\n' "$output"
exit 0
`;
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

    // 5. Hooks → event name mapping + wrapper scripts
    if (plugin.hooks) {
      const { converted, unmapped, wrapperScripts } = convertHooks(
        plugin.hooks.raw
      );
      await writeOut("hooks/hooks.json", converted);
      for (const event of unmapped) {
        warnings.push({
          plugin: plugin.dirName,
          message: `Unmapped hook event "${event}" — skipped`,
        });
      }
      // Generate wrapper scripts for each hook script
      for (const scriptName of wrapperScripts) {
        const wrapperContent = generateHookWrapper(scriptName);
        const wrapperPath = `scripts/gemini-${scriptName}`;
        await writeOut(wrapperPath, wrapperContent);
        if (!dryRun) {
          await chmod(path.join(extDir, wrapperPath), 0o755);
        }
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
