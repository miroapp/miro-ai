import Ajv from "ajv";
import fg from "fast-glob";
import matter from "gray-matter";
import { readFile } from "fs/promises";
import path from "path";

// Import schemas
import skillSchema from "../schemas/skill-frontmatter.schema.json";
import commandSchema from "../schemas/command-frontmatter.schema.json";
import agentSchema from "../schemas/agent-frontmatter.schema.json";
import powerSchema from "../schemas/power-frontmatter.schema.json";

export interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

export interface FrontmatterValidationResults {
  hasErrors: boolean;
  results: ValidationResult[];
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validators = {
  skill: ajv.compile(skillSchema),
  command: ajv.compile(commandSchema),
  agent: ajv.compile(agentSchema),
  power: ajv.compile(powerSchema),
};

/**
 * Validates that skill name matches its directory name per agentskills.io spec.
 * https://agentskills.io/specification
 */
function validateNameMatchesDirectory(
  filePath: string,
  data: Record<string, unknown>
): string[] {
  const errors: string[] = [];
  const name = data.name as string | undefined;

  if (name) {
    const dirName = path.basename(path.dirname(filePath));
    if (name !== dirName) {
      errors.push(
        `name "${name}" must match directory name "${dirName}" (agentskills.io spec)`
      );
    }

    // Enforce miro- prefix for plugin skills (distributed as Agent Skills)
    if (filePath.includes("claude-plugins/") && !name.startsWith("miro-")) {
      errors.push(
        `name "${name}" must start with "miro-" (plugin naming convention)`
      );
    }
  }

  return errors;
}

async function validateFile(
  filePath: string,
  validator: ReturnType<typeof ajv.compile>,
  type: string,
  extraValidation?: (filePath: string, data: Record<string, unknown>) => string[]
): Promise<ValidationResult> {
  try {
    const content = await readFile(filePath, "utf-8");
    const { data } = matter(content);

    if (Object.keys(data).length === 0) {
      return {
        file: filePath,
        valid: false,
        errors: [`No YAML frontmatter found in ${type} file`],
      };
    }

    const errors: string[] = [];

    // Schema validation
    const valid = validator(data);
    if (!valid) {
      errors.push(
        ...(validator.errors?.map((e) => `${e.instancePath || "root"}: ${e.message}`) || [])
      );
    }

    // Extra validation (e.g., name-directory match for skills)
    if (extraValidation) {
      errors.push(...extraValidation(filePath, data as Record<string, unknown>));
    }

    if (errors.length > 0) {
      return { file: filePath, valid: false, errors };
    }

    return { file: filePath, valid: true, errors: [] };
  } catch (e) {
    return {
      file: filePath,
      valid: false,
      errors: [(e as Error).message],
    };
  }
}

export async function validateFrontmatter(
  root: string
): Promise<FrontmatterValidationResults> {
  const results: ValidationResult[] = [];

  // Validate SKILL.md files (with name-directory match per agentskills.io spec)
  const skillFiles = await fg("**/skills/*/SKILL.md", {
    cwd: root,
    ignore: ["**/node_modules/**"],
    dot: true, // Include hidden directories like .claude/
  });
  for (const file of skillFiles) {
    results.push(
      await validateFile(
        path.join(root, file),
        validators.skill,
        "SKILL.md",
        validateNameMatchesDirectory
      )
    );
  }

  // Validate command .md files (in commands/ directories)
  const commandFiles = await fg("**/commands/*.md", {
    cwd: root,
    ignore: ["**/node_modules/**"],
  });
  for (const file of commandFiles) {
    results.push(
      await validateFile(path.join(root, file), validators.command, "command")
    );
  }

  // Validate agent .md files
  const agentFiles = await fg("**/agents/*.md", {
    cwd: root,
    ignore: ["**/node_modules/**"],
  });
  for (const file of agentFiles) {
    results.push(
      await validateFile(path.join(root, file), validators.agent, "agent")
    );
  }

  // Validate POWER.md files (Kiro powers)
  const powerFiles = await fg("**/POWER.md", {
    cwd: root,
    ignore: ["**/node_modules/**"],
  });
  for (const file of powerFiles) {
    results.push(
      await validateFile(path.join(root, file), validators.power, "POWER.md")
    );
  }

  return {
    hasErrors: results.some((r) => !r.valid),
    results,
  };
}
