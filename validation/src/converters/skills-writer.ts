import { mkdir, readFile, writeFile } from "fs/promises";
import matter from "gray-matter";
import path from "path";
import type { ClaudePlugin, ConversionResult, ConversionWarning } from "./types";

/**
 * Write Agent Skills (agentskills.io format) from a Claude plugin.
 * Copies SKILL.md + references/ to skills/{skill-name}/.
 */
export async function writeAgentSkills(
  plugin: ClaudePlugin,
  outputDir: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];

  async function writeOut(relPath: string, content: string) {
    const fullPath = path.join(outputDir, relPath);
    filesWritten.push(relPath);
    if (!dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, content, "utf-8");
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

      // Copy SKILL.md (read raw to preserve frontmatter)
      const raw = await readFile(
        path.join(plugin.absPath, skill.relPath),
        "utf-8"
      );
      const { data, content } = matter(raw);

      // Ensure name field matches in output
      data.name = skillName;
      const output = matter.stringify(content, data);
      await writeOut(`${skillName}/SKILL.md`, output);

      // Copy references
      for (const ref of skill.references) {
        const refContent = await readFile(
          path.join(plugin.absPath, ref),
          "utf-8"
        );
        const refFileName = path.basename(ref);
        await writeOut(`${skillName}/references/${refFileName}`, refContent);
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
