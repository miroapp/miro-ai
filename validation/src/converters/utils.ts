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

