/**
 * Convert a string to kebab-case.
 * "Miro Tasks" → "miro-tasks", "miroTasks" → "miro-tasks"
 */
export function toKebabCase(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Replace ${CLAUDE_PLUGIN_ROOT} with the target platform variable.
 */
export function substituteVars(
  content: string,
  replacements: Record<string, string>
): string {
  let result = content;
  for (const [from, to] of Object.entries(replacements)) {
    result = result.replaceAll(from, to);
  }
  return result;
}

/**
 * Minimal TOML serializer for Gemini command files.
 * Handles: description (string), prompt (multi-line triple-quoted string).
 */
export function serializeToml(data: {
  description: string;
  prompt: string;
}): string {
  const lines: string[] = [];
  lines.push(`description = ${JSON.stringify(data.description)}`);
  lines.push("");
  lines.push(`prompt = """`);
  lines.push(data.prompt);
  lines.push(`"""`);
  return lines.join("\n") + "\n";
}

/**
 * Hook event name mapping from Claude → Gemini.
 */
export const HOOK_EVENT_MAP: Record<string, string> = {
  Stop: "AfterAgent",
  PreToolUse: "BeforeTool",
  PostToolUse: "AfterTool",
  SessionStart: "SessionStart",
  UserPromptSubmit: "BeforeAgent",
};
