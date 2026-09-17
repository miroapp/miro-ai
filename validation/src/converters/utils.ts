import { readdir, rm } from "fs/promises";
import path from "path";

/**
 * Delete generated skill directories that the source plugin no longer has.
 * Writers only ever overwrite, so without this a removed skill keeps shipping.
 */
export async function pruneStaleSkills(
  skillsRoot: string,
  keep: string[],
  dryRun: boolean
): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(skillsRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  const kept = new Set(keep);
  const stale = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("miro-"))
    .map((e) => e.name)
    .filter((name) => !kept.has(name));

  if (!dryRun) {
    for (const name of stale) {
      await rm(path.join(skillsRoot, name), { recursive: true, force: true });
    }
  }

  return stale;
}

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

