#!/usr/bin/env bun
import { mkdir, readdir, rm } from "fs/promises";
import path from "path";
import { validateCopilotCoworkPackages } from "./copilot-cowork-validator";
import { readClaudePlugin } from "./converters/claude-reader";
import { writeCopilotCoworkPlugin } from "./converters/copilot-cowork-writer";

const ROOT = process.cwd();
const TARGET_PLUGIN = "miro";
const OUTPUT_DIR = path.join(ROOT, "copilot-cowork-plugins");
const DIST_DIR = path.join(ROOT, "dist");

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

async function ensureZipAvailable() {
  const proc = Bun.spawn(["zip", "-v"], {
    stdout: "ignore",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(
      stderr.trim() || 'The "zip" command is required to package Copilot Cowork plugins'
    );
  }
}

async function createArchive(packageDir: string, archivePath: string) {
  await rm(archivePath, { force: true });

  const proc = Bun.spawn(["zip", "-r", "-X", "-q", archivePath, "."], {
    cwd: packageDir,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stderr = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(stderr.trim() || "zip command failed");
  }
}

async function removeExistingArchives() {
  try {
    const entries = await readdir(DIST_DIR);
    await Promise.all(
      entries
        .filter((entry) => /^miro-copilot-cowork-.*\.zip$/.test(entry))
        .map((entry) => rm(path.join(DIST_DIR, entry), { force: true }))
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }
}

async function main() {
  console.log(bold("\nPackaging Copilot Cowork plugin\n"));

  const plugin = await readClaudePlugin(
    path.join(ROOT, "claude-plugins", TARGET_PLUGIN)
  );
  if (!plugin) {
    throw new Error(`Claude plugin "${TARGET_PLUGIN}" was not found`);
  }

  await ensureZipAvailable();

  console.log(`- ${dim("Generating package folder")}`);
  const conversion = await writeCopilotCoworkPlugin(plugin, OUTPUT_DIR, false);
  if (conversion.warnings.length > 0) {
    for (const warning of conversion.warnings) {
      console.log(`  ${yellow("⚠")} ${warning.message}`);
    }
  }
  if (!conversion.success) {
    for (const error of conversion.errors) {
      console.error(`  ${red("✗")} ${error}`);
    }
    throw new Error("Copilot Cowork conversion failed");
  }

  console.log(`- ${dim("Validating generated package")}`);
  const validation = await validateCopilotCoworkPackages(ROOT);
  if (validation.hasErrors) {
    for (const result of validation.results) {
      if (!result.valid) {
        console.error(`  ${red("✗")} ${result.item}`);
        for (const error of result.errors) {
          console.error(`    ${error}`);
        }
      }
    }
    throw new Error("Copilot Cowork validation failed");
  }

  const version = plugin.manifest.version ?? "1.0.0";
  const archiveName = `${TARGET_PLUGIN}-copilot-cowork-${version}.zip`;
  const archivePath = path.join(DIST_DIR, archiveName);
  const packageDir = path.join(OUTPUT_DIR, TARGET_PLUGIN);

  console.log(`- ${dim("Creating zip archive")}`);
  await mkdir(DIST_DIR, { recursive: true });
  await removeExistingArchives();
  await createArchive(packageDir, archivePath);

  console.log(`\n${green("✓")} Created ${path.relative(ROOT, archivePath)}`);
}

main().catch((error) => {
  console.error(`\n${red("Packaging failed:")} ${(error as Error).message}`);
  process.exit(1);
});
