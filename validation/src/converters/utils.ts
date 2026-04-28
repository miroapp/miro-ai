/**
 * Convert kebab-case to Title Case display name.
 * "miro-tasks" → "Miro Tasks", "miro" → "Miro"
 */
export function toDisplayName(kebab: string): string {
  return kebab
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function escapeYamlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
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
