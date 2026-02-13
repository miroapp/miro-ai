#!/usr/bin/env bun
import path from "path";
import { readAllPlugins } from "./claude-reader";
import { writeGeminiExtension } from "./gemini-writer";
import { writeAgentSkills } from "./skills-writer";
import type { ConversionResult, ConversionSummary } from "./types";

const ROOT = process.cwd();
const args = process.argv.slice(2);

// Parse flags
const dryRun = args.includes("--dry-run");
const pluginFlag = args.find((a) => a.startsWith("--plugin="));
const pluginFilter = pluginFlag?.split("=")[1];
const hasGeminiFlag = args.includes("--gemini");
const hasSkillsFlag = args.includes("--skills");
// No flags = both targets; specific flag = only that target
const targetGemini = hasGeminiFlag || !hasSkillsFlag;
const targetSkills = hasSkillsFlag || !hasGeminiFlag;

// ANSI colors (match validation/src/index.ts)
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

// Plugins excluded from Gemini conversion
const GEMINI_EXCLUDED = new Set(["miro-solutions"]);

async function main() {
  console.log(
    bold(
      "\n╔════════════════════════════════════════════════════════════════╗"
    )
  );
  console.log(
    bold(
      "║                  MIRO AI CONVERTER                            ║"
    )
  );
  console.log(
    bold(
      "╚════════════════════════════════════════════════════════════════╝"
    )
  );

  if (dryRun) {
    console.log(yellow("\n  [DRY RUN] No files will be written.\n"));
  }

  // Read all Claude plugins
  printHeader("Reading Claude Plugins");
  let plugins = await readAllPlugins(ROOT);

  if (pluginFilter) {
    plugins = plugins.filter((p) => p.dirName === pluginFilter);
    if (plugins.length === 0) {
      console.log(`│ ${red("✗")} Plugin "${pluginFilter}" not found`);
      printFooter();
      process.exit(1);
    }
  }

  for (const p of plugins) {
    const parts = [
      `${p.commands.length} cmd`,
      `${p.skills.length} skill`,
      `${p.agents.length} agent`,
    ];
    if (p.hooks) parts.push("hooks");
    if (p.scripts.length > 0) parts.push(`${p.scripts.length} script`);
    if (p.templates.length > 0) parts.push(`${p.templates.length} tmpl`);
    if (p.mcp) parts.push("mcp");
    console.log(`│ ${green("✓")} ${p.dirName} ${dim(`(${parts.join(", ")})`)}`);
  }
  printFooter();

  const results: ConversionResult[] = [];

  // Gemini conversion
  if (targetGemini) {
    printHeader("Gemini Extensions");
    const geminiDir = path.join(ROOT, "gemini-extensions");
    for (const plugin of plugins) {
      if (GEMINI_EXCLUDED.has(plugin.dirName)) {
        console.log(
          `│ ${yellow("⚠")} ${plugin.dirName} ${dim("(excluded, skipped)")}`
        );
        continue;
      }
      const result = await writeGeminiExtension(plugin, geminiDir, dryRun);
      results.push(result);
      const status = result.success ? green("✓") : red("✗");
      console.log(
        `│ ${status} ${plugin.dirName} → gemini-extensions/${plugin.dirName}/ ${dim(`(${result.filesWritten.length} files)`)}`
      );
      for (const w of result.warnings) {
        console.log(`│   └─ ${yellow("⚠")} ${w.message}`);
      }
      for (const e of result.errors) {
        console.log(`│   └─ ${red("✗")} ${e}`);
      }
    }
    printFooter();
  }

  // Agent Skills conversion
  if (targetSkills) {
    printHeader("Agent Skills");
    const skillsDir = path.join(ROOT, "skills");
    for (const plugin of plugins) {
      if (plugin.skills.length === 0) {
        continue;
      }
      const result = await writeAgentSkills(plugin, skillsDir, dryRun);
      results.push(result);
      const status = result.success ? green("✓") : red("✗");
      const skillNames = plugin.skills.map((s) => s.name).join(", ");
      console.log(
        `│ ${status} ${plugin.dirName} → skills/ ${dim(`(${result.filesWritten.length} files: ${skillNames})`)}`
      );
      for (const w of result.warnings) {
        console.log(`│   └─ ${yellow("⚠")} ${w.message}`);
      }
      for (const e of result.errors) {
        console.log(`│   └─ ${red("✗")} ${e}`);
      }
    }
    printFooter();
  }

  // Summary
  const summary: ConversionSummary = {
    results,
    totalPlugins: plugins.length,
    totalFiles: results.reduce((n, r) => n + r.filesWritten.length, 0),
    totalWarnings: results.reduce((n, r) => n + r.warnings.length, 0),
    totalErrors: results.reduce((n, r) => n + r.errors.length, 0),
    hasErrors: results.some((r) => !r.success),
  };

  console.log("\n" + bold("Summary:"));
  console.log(
    dim(
      `  ${summary.totalPlugins} plugin(s) → ${summary.totalFiles} file(s) generated`
    )
  );
  if (summary.totalErrors === 0 && summary.totalWarnings === 0) {
    console.log(green("  All conversions passed!"));
  } else {
    if (summary.totalErrors > 0) {
      console.log(red(`  ${summary.totalErrors} error(s)`));
    }
    if (summary.totalWarnings > 0) {
      console.log(yellow(`  ${summary.totalWarnings} warning(s)`));
    }
  }

  process.exit(summary.hasErrors ? 1 : 0);
}

main().catch((e) => {
  console.error(red("Conversion failed:"), e);
  process.exit(1);
});
