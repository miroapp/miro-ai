import { execa } from "execa";
import fg from "fast-glob";
import path from "path";

export interface ClaudeValidationResult {
  plugin: string;
  valid: boolean;
  output: string;
  errors: string[];
}

export interface ClaudeValidationResults {
  hasErrors: boolean;
  cliAvailable: boolean;
  results: ClaudeValidationResult[];
}

export async function validateClaudePlugins(
  root: string
): Promise<ClaudeValidationResults> {
  const results: ClaudeValidationResult[] = [];

  // Check if claude CLI is available
  let cliAvailable = true;
  try {
    await execa("claude", ["--version"]);
  } catch {
    cliAvailable = false;
    console.warn(
      "Warning: claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code"
    );
    return { hasErrors: false, cliAvailable: false, results: [] };
  }

  // Find all plugin directories (those with .claude-plugin/plugin.json)
  const pluginManifests = await fg("claude-plugins/*/.claude-plugin/plugin.json", {
    cwd: root,
  });

  for (const manifest of pluginManifests) {
    const pluginDir = path.dirname(path.dirname(manifest));
    const pluginPath = path.join(root, pluginDir);
    const pluginName = path.basename(pluginDir);

    try {
      const result = await execa("claude", ["plugin", "validate", pluginPath], {
        reject: false,
      });

      const output = result.stdout + result.stderr;
      const valid = result.exitCode === 0;
      const errors: string[] = [];

      if (!valid) {
        // Extract error messages from output
        const lines = output.split("\n").filter((line) => line.trim());
        errors.push(...lines);
      }

      results.push({
        plugin: pluginName,
        valid,
        output,
        errors,
      });
    } catch (e) {
      results.push({
        plugin: pluginName,
        valid: false,
        output: "",
        errors: [(e as Error).message],
      });
    }
  }

  return {
    hasErrors: results.some((r) => !r.valid),
    cliAvailable: true,
    results,
  };
}
