import Ajv from "ajv";
import fg from "fast-glob";
import { readFile } from "fs/promises";
import path from "path";
import codexMarketplaceSchema from "../schemas/codex-marketplace.schema.json";
import codexPluginSchema from "../schemas/codex-plugin.schema.json";

export interface CodexValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
}

export interface CodexValidationResults {
  hasErrors: boolean;
  results: CodexValidationResult[];
}

const ajv = new Ajv({ allErrors: true, strict: false });
const pluginValidator = ajv.compile(codexPluginSchema);
const marketplaceValidator = ajv.compile(codexMarketplaceSchema);

async function validateJsonFile(
  filePath: string,
  validator: ReturnType<typeof ajv.compile>,
  extraValidation?: (data: Record<string, unknown>, filePath: string) => string[]
): Promise<CodexValidationResult> {
  try {
    const raw = await readFile(filePath, "utf-8");
    const data = JSON.parse(raw) as Record<string, unknown>;
    const errors: string[] = [];

    if (!validator(data)) {
      errors.push(
        ...(validator.errors?.map((e) => `${e.instancePath || "root"}: ${e.message}`) ?? [])
      );
    }

    if (extraValidation) {
      errors.push(...extraValidation(data, filePath));
    }

    return {
      file: filePath,
      valid: errors.length === 0,
      errors,
    };
  } catch (e) {
    return {
      file: filePath,
      valid: false,
      errors: [(e as Error).message],
    };
  }
}

function validatePluginDirMatch(
  data: Record<string, unknown>,
  filePath: string
): string[] {
  const errors: string[] = [];
  const dirName = path.basename(path.dirname(path.dirname(filePath)));
  const name = data.name;

  if (typeof name === "string" && name !== dirName) {
    errors.push(`name "${name}" must match plugin directory "${dirName}"`);
  }

  return errors;
}

function validateMarketplacePluginPaths(
  data: Record<string, unknown>
): string[] {
  const errors: string[] = [];
  const plugins = Array.isArray(data.plugins)
    ? (data.plugins as Array<Record<string, unknown>>)
    : [];

  for (const plugin of plugins) {
    const name = plugin.name;
    const source = plugin.source as Record<string, unknown> | undefined;
    const pathValue = source?.path;

    if (
      typeof name === "string" &&
      typeof pathValue === "string" &&
      pathValue !== `./codex/${name}`
    ) {
      errors.push(
        `plugin "${name}" must use source.path "./codex/${name}" (found "${pathValue}")`
      );
    }
  }

  return errors;
}

export async function validateCodexPlugins(
  root: string
): Promise<CodexValidationResults> {
  const results: CodexValidationResult[] = [];

  const pluginFiles = await fg("codex/*/.codex-plugin/plugin.json", {
    cwd: root,
  });

  for (const file of pluginFiles) {
    results.push(
      await validateJsonFile(
        path.join(root, file),
        pluginValidator,
        validatePluginDirMatch
      )
    );
  }

  const marketplacePath = path.join(root, ".agents", "plugins", "marketplace.json");
  try {
    await readFile(marketplacePath, "utf-8");
    results.push(
      await validateJsonFile(
        marketplacePath,
        marketplaceValidator,
        validateMarketplacePluginPaths
      )
    );
  } catch {
    if (pluginFiles.length > 0) {
      results.push({
        file: marketplacePath,
        valid: false,
        errors: ["Missing .agents/plugins/marketplace.json"],
      });
    }
  }

  return {
    hasErrors: results.some((result) => !result.valid),
    results,
  };
}
