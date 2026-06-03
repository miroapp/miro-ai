import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";

export const SKILL_CHAR_LIMIT = 20000;

export interface SkillLimitResult {
  file: string;
  valid: boolean;
  charCount: number;
  errors: string[];
}

export interface SkillLimitsResults {
  hasErrors: boolean;
  results: SkillLimitResult[];
}

/**
 * Validates that each SKILL.md stays within the Agent Skills character limit.
 * The entire file (frontmatter + body) is counted, as Unicode code points.
 */
export async function validateSkillLimits(
  root: string
): Promise<SkillLimitsResults> {
  const results: SkillLimitResult[] = [];

  const skillFiles = await fg("**/skills/*/SKILL.md", {
    cwd: root,
    ignore: ["**/node_modules/**"],
    dot: true, // Include hidden directories like .claude/
  });

  for (const file of skillFiles) {
    const filePath = path.join(root, file);
    try {
      const content = await readFile(filePath, "utf-8");
      const charCount = [...content].length;
      const valid = charCount <= SKILL_CHAR_LIMIT;

      results.push({
        file: filePath,
        valid,
        charCount,
        errors: valid
          ? []
          : [
              `${charCount} chars exceeds ${SKILL_CHAR_LIMIT} limit (over by ${
                charCount - SKILL_CHAR_LIMIT
              })`,
            ],
      });
    } catch (e) {
      results.push({
        file: filePath,
        valid: false,
        charCount: 0,
        errors: [(e as Error).message],
      });
    }
  }

  return {
    hasErrors: results.some((r) => !r.valid),
    results,
  };
}
