import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";

/**
 * Write Agent Skills (agentskills.io format) from a Claude plugin.
 * Copies SKILL.md + references/ verbatim — no transformation.
 */
export async function writeAgentSkills(
  plugin: ClaudePlugin,
  outputDir: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];

  async function copyOut(srcRel: string, destRel: string) {
    const fullPath = path.join(outputDir, destRel);
    filesWritten.push(destRel);
    if (!dryRun) {
      const content = await readFile(path.join(plugin.absPath, srcRel));
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content);
    }
  }

  try {
    for (const skill of plugin.skills) {
      const skillName = skill.name;

      if (!skillName.startsWith("miro-")) {
        errors.push(
          `Skill "${skillName}" in ${plugin.dirName} must start with "miro-"`
        );
        continue;
      }

      await copyOut(skill.relPath, `${skillName}/SKILL.md`);

      for (const ref of skill.references) {
        const refFileName = path.basename(ref);
        await copyOut(ref, `${skillName}/references/${refFileName}`);
      }
    }
  } catch (e) {
    errors.push(`Failed to write agent skills: ${(e as Error).message}`);
  }

  return {
    plugin: plugin.dirName,
    target: "skills",
    success: errors.length === 0,
    filesWritten,
    warnings,
    errors,
  };
}
