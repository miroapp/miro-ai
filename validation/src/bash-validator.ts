import { execa } from "execa";
import fg from "fast-glob";
import { stat } from "fs/promises";
import path from "path";

export interface BashValidationResult {
  file: string;
  valid: boolean;
  executable: boolean;
  errors: string[];
  warnings: string[];
}

export interface BashValidationResults {
  hasErrors: boolean;
  results: BashValidationResult[];
}

interface ShellCheckIssue {
  line: number;
  column: number;
  level: "error" | "warning" | "info" | "style";
  code: number;
  message: string;
}

async function checkExecutable(filePath: string): Promise<boolean> {
  try {
    const stats = await stat(filePath);
    return (stats.mode & 0o111) !== 0;
  } catch {
    return false;
  }
}

async function runShellCheck(
  filePath: string
): Promise<{ errors: string[]; warnings: string[] }> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    await execa("shellcheck", ["--format=json", filePath]);
    // If no error, script is clean
  } catch (e: unknown) {
    const execaError = e as { stdout?: string; stderr?: string };
    if (execaError.stdout) {
      try {
        const issues: ShellCheckIssue[] = JSON.parse(execaError.stdout);
        for (const issue of issues) {
          const msg = `Line ${issue.line}: ${issue.message} (SC${issue.code})`;
          if (issue.level === "error") {
            errors.push(msg);
          } else {
            warnings.push(msg);
          }
        }
      } catch {
        // JSON parse failed, treat as error
        errors.push(`ShellCheck output parse error: ${execaError.stdout}`);
      }
    }
  }

  return { errors, warnings };
}

export async function validateBashScripts(
  root: string
): Promise<BashValidationResults> {
  const results: BashValidationResult[] = [];

  // Find all .sh files
  const scriptFiles = await fg("**/scripts/*.sh", {
    cwd: root,
    ignore: ["**/node_modules/**"],
  });

  // Check if shellcheck is available
  let shellcheckAvailable = true;
  try {
    await execa("shellcheck", ["--version"]);
  } catch {
    shellcheckAvailable = false;
    console.warn(
      "Warning: shellcheck not found. Install with: brew install shellcheck"
    );
  }

  for (const file of scriptFiles) {
    const fullPath = path.join(root, file);
    const executable = await checkExecutable(fullPath);
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!executable) {
      errors.push("File is not executable (missing +x permission)");
    }

    if (shellcheckAvailable) {
      const shellcheckResult = await runShellCheck(fullPath);
      errors.push(...shellcheckResult.errors);
      warnings.push(...shellcheckResult.warnings);
    }

    results.push({
      file: fullPath,
      valid: errors.length === 0,
      executable,
      errors,
      warnings,
    });
  }

  return {
    hasErrors: results.some((r) => !r.valid),
    results,
  };
}
