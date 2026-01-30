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

async function validateFile(
  filePath: string,
  validator: ReturnType<typeof ajv.compile>,
  type: string
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

    const valid = validator(data);
    if (!valid) {
      const errors =
        validator.errors?.map((e) => `${e.instancePath || "root"}: ${e.message}`) || [];
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

  // Validate SKILL.md files
  const skillFiles = await fg("**/skills/*/SKILL.md", {
    cwd: root,
    ignore: ["**/node_modules/**"],
  });
  for (const file of skillFiles) {
    results.push(
      await validateFile(path.join(root, file), validators.skill, "SKILL.md")
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
