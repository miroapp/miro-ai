#!/usr/bin/env bun
import { rm } from "fs/promises";
import path from "path";
import { readAllPlugins } from "./claude-reader";
import {
  isCodexGeneratedPlugin,
  CODEX_PLUGIN_ORDER,
  isSharedGeneratedPlugin,
  SHARED_GENERATED_PLUGIN_ORDER,
} from "./codex-config";
import {
  writeCodexMarketplace,
  writeCodexPlugin,
} from "./codex-writer";
import { writeCopilotCoworkPlugin } from "./copilot-cowork-writer";
import { writeCursorPlugin } from "./cursor-writer";
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
const hasCursorFlag = args.includes("--cursor");
const hasCodexFlag = args.includes("--codex");
const hasCopilotCoworkFlag = args.includes("--copilot-cowork");
// No flags = all targets; specific flag = only that target
const hasAnyFlag =
  hasGeminiFlag ||
  hasSkillsFlag ||
  hasCursorFlag ||
  hasCodexFlag ||
  hasCopilotCoworkFlag;
const targetGemini = hasGeminiFlag || !hasAnyFlag;
const targetSkills = hasSkillsFlag || !hasAnyFlag;
const targetCursor = hasCursorFlag || !hasAnyFlag;
const targetCodex = hasCodexFlag || !hasAnyFlag;
const targetCopilotCowork = hasCopilotCoworkFlag || !hasAnyFlag;

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

// Plugins excluded from Cursor conversion
const CURSOR_EXCLUDED = new Set<string>();

// Plugins included in Copilot Cowork conversion
const COPILOT_COWORK_INCLUDED = new Set(["miro"]);

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
    const parts = [`${p.skills.length} skill`];
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
      if (!isSharedGeneratedPlugin(plugin.dirName)) {
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

  // Cursor Plugins conversion
  if (targetCursor) {
    printHeader("Cursor Plugins");
    const cursorDir = path.join(ROOT, "cursor-plugins");
    for (const plugin of plugins) {
      if (CURSOR_EXCLUDED.has(plugin.dirName)) {
        console.log(
          `│ ${yellow("⚠")} ${plugin.dirName} ${dim("(excluded, skipped)")}`
        );
        continue;
      }
      const result = await writeCursorPlugin(plugin, cursorDir, dryRun);
      results.push(result);
      const status = result.success ? green("✓") : red("✗");
      console.log(
        `│ ${status} ${plugin.dirName} → cursor-plugins/${plugin.dirName}/ ${dim(`(${result.filesWritten.length} files)`)}`
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

  // Codex Plugins conversion
  if (targetCodex) {
    printHeader("Codex Plugins");
    const codexDir = path.join(ROOT, "codex-plugins");
    const legacyCodexDirs = [
      path.join(ROOT, "codex"),
      path.join(ROOT, "plugins"),
    ];
    const selectedCodexPlugins = plugins.filter((plugin) =>
      isCodexGeneratedPlugin(plugin.dirName)
    );

    for (const plugin of plugins) {
      if (!isCodexGeneratedPlugin(plugin.dirName)) {
        console.log(
          `│ ${yellow("⚠")} ${plugin.dirName} ${dim("(excluded, skipped)")}`
        );
        continue;
      }
      const result = await writeCodexPlugin(plugin, codexDir, dryRun);
      results.push(result);
      const status = result.success ? green("✓") : red("✗");
      console.log(
        `│ ${status} ${plugin.dirName} → codex-plugins/${plugin.dirName}/ ${dim(`(${result.filesWritten.length} files)`)}`
      );
      for (const w of result.warnings) {
        console.log(`│   └─ ${yellow("⚠")} ${w.message}`);
      }
      for (const e of result.errors) {
        console.log(`│   └─ ${red("✗")} ${e}`);
      }
    }

    if (pluginFilter) {
      console.log(
        `│ ${yellow("⚠")} .agents/plugins/marketplace.json ${dim("(skipped when --plugin is used)")}`
      );
    } else {
      if (!dryRun) {
        for (const legacyCodexDir of legacyCodexDirs) {
          for (const pluginName of SHARED_GENERATED_PLUGIN_ORDER) {
            await rm(path.join(legacyCodexDir, pluginName), {
              recursive: true,
              force: true,
            });
          }
        }

        for (const pluginName of SHARED_GENERATED_PLUGIN_ORDER) {
          if (!CODEX_PLUGIN_ORDER.includes(pluginName as (typeof CODEX_PLUGIN_ORDER)[number])) {
            await rm(path.join(codexDir, pluginName), {
              recursive: true,
              force: true,
            });
          }
        }
      }

      const marketplaceResult = await writeCodexMarketplace(
        selectedCodexPlugins,
        ROOT,
        dryRun
      );
      if (marketplaceResult.errors.length === 0) {
        console.log(
          `│ ${green("✓")} ${marketplaceResult.fileWritten} ${dim("(curated repo marketplace)")}`
        );
        results.push({
          plugin: "miro-ai",
          target: "codex",
          success: true,
          filesWritten: marketplaceResult.fileWritten
            ? [marketplaceResult.fileWritten]
            : [],
          warnings: [],
          errors: [],
        });
      } else {
        console.log(
          `│ ${red("✗")} ${marketplaceResult.fileWritten ?? ".agents/plugins/marketplace.json"}`
        );
        for (const e of marketplaceResult.errors) {
          console.log(`│   └─ ${red("✗")} ${e}`);
        }
        results.push({
          plugin: "miro-ai",
          target: "codex",
          success: false,
          filesWritten: [],
          warnings: [],
          errors: marketplaceResult.errors,
        });
      }
    }

    printFooter();
  }

  // Copilot Cowork conversion
  if (targetCopilotCowork) {
    printHeader("Copilot Cowork Packages");
    const copilotCoworkDir = path.join(ROOT, "copilot-cowork-plugins");

    if (pluginFilter && !COPILOT_COWORK_INCLUDED.has(pluginFilter)) {
      console.log(
        `│ ${red("✗")} ${pluginFilter} ${dim("(Copilot Cowork conversion is only supported for miro)")}`
      );
      printFooter();
      process.exit(1);
    }

    for (const plugin of plugins) {
      if (!COPILOT_COWORK_INCLUDED.has(plugin.dirName)) {
        console.log(
          `│ ${yellow("⚠")} ${plugin.dirName} ${dim("(not supported, skipped)")}`
        );
        continue;
      }

      const result = await writeCopilotCoworkPlugin(
        plugin,
        copilotCoworkDir,
        dryRun
      );
      results.push(result);
      const status = result.success ? green("✓") : red("✗");
      console.log(
        `│ ${status} ${plugin.dirName} → copilot-cowork-plugins/${plugin.dirName}/ ${dim(`(${result.filesWritten.length} files)`)}`
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
