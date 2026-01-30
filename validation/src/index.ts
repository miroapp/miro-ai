#!/usr/bin/env bun
import { validateFrontmatter } from "./frontmatter-validator";
import { validateBashScripts } from "./bash-validator";
import { validateClaudePlugins } from "./claude-validator";
import { checkConsistency } from "./consistency-checker";

const ROOT = process.cwd();
const args = process.argv.slice(2);

// Parse flags
const frontmatterOnly = args.includes("--frontmatter-only");
const bashOnly = args.includes("--bash-only");
const claudeOnly = args.includes("--claude-only");
const consistencyOnly = args.includes("--consistency-only");
const runAll = !frontmatterOnly && !bashOnly && !claudeOnly && !consistencyOnly;

// ANSI colors
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

function printHeader(title: string) {
  console.log("\n" + bold(`┌─ ${title} ${"─".repeat(60 - title.length)}┐`));
}

function printFooter() {
  console.log(bold("└" + "─".repeat(63) + "┘"));
}

async function main() {
  console.log(bold("\n╔════════════════════════════════════════════════════════════════╗"));
  console.log(bold("║                    MIRO AI VALIDATION                          ║"));
  console.log(bold("╚════════════════════════════════════════════════════════════════╝"));

  let totalErrors = 0;
  let totalWarnings = 0;

  // Claude Plugin Validation (built-in CLI)
  if (runAll || claudeOnly) {
    printHeader("Claude Plugin Validation");
    const claudeResults = await validateClaudePlugins(ROOT);

    if (!claudeResults.cliAvailable) {
      console.log(yellow("│ ⚠ Claude CLI not available - skipping"));
    } else {
      for (const result of claudeResults.results) {
        if (result.valid) {
          console.log(`│ ${green("✓")} ${result.plugin}`);
        } else {
          console.log(`│ ${red("✗")} ${result.plugin}`);
          for (const error of result.errors) {
            console.log(`│   └─ ${error}`);
          }
          totalErrors++;
        }
      }
      if (claudeResults.results.length === 0) {
        console.log(dim("│ No Claude plugins found"));
      }
    }
    printFooter();
  }

  // Frontmatter Validation
  if (runAll || frontmatterOnly) {
    printHeader("Frontmatter Validation");
    const fmResults = await validateFrontmatter(ROOT);

    for (const result of fmResults.results) {
      const relPath = result.file.replace(ROOT + "/", "");
      if (result.valid) {
        console.log(`│ ${green("✓")} ${relPath}`);
      } else {
        console.log(`│ ${red("✗")} ${relPath}`);
        for (const error of result.errors) {
          console.log(`│   └─ ${error}`);
        }
        totalErrors++;
      }
    }
    if (fmResults.results.length === 0) {
      console.log(dim("│ No frontmatter files found"));
    }
    printFooter();
  }

  // Bash Script Validation
  if (runAll || bashOnly) {
    printHeader("Bash Script Validation");
    const bashResults = await validateBashScripts(ROOT);

    for (const result of bashResults.results) {
      const relPath = result.file.replace(ROOT + "/", "");
      const status = result.valid
        ? result.warnings.length > 0
          ? yellow("⚠")
          : green("✓")
        : red("✗");

      const execStatus = result.executable ? "" : dim(" [not executable]");
      console.log(`│ ${status} ${relPath}${execStatus}`);

      for (const error of result.errors) {
        console.log(`│   └─ ${red(error)}`);
      }
      for (const warning of result.warnings) {
        console.log(`│   └─ ${yellow(warning)}`);
        totalWarnings++;
      }
      if (!result.valid) totalErrors++;
    }
    if (bashResults.results.length === 0) {
      console.log(dim("│ No bash scripts found"));
    }
    printFooter();
  }

  // Consistency Checks
  if (runAll || consistencyOnly) {
    printHeader("Consistency Checks");
    const consistencyResults = await checkConsistency(ROOT);

    for (const result of consistencyResults.results) {
      const status = result.valid ? green("✓") : red("✗");
      console.log(`│ ${status} ${result.check}`);
      for (const detail of result.details) {
        console.log(`│   └─ ${dim(detail)}`);
      }
      if (!result.valid) totalErrors++;
    }
    printFooter();
  }

  // Summary
  console.log("\n" + bold("Summary:"));
  if (totalErrors === 0 && totalWarnings === 0) {
    console.log(green("  All validations passed!"));
  } else {
    if (totalErrors > 0) {
      console.log(red(`  ${totalErrors} error(s)`));
    }
    if (totalWarnings > 0) {
      console.log(yellow(`  ${totalWarnings} warning(s)`));
    }
  }

  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(red("Validation failed:"), e);
  process.exit(1);
});
