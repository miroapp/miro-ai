#!/usr/bin/env bun
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const CURSOR_PLUGINS_SRC = path.join(ROOT, "cursor-plugins");
const CURSOR_PLUGINS_DEST = path.join(
  process.env.HOME!,
  ".cursor",
  "plugins",
  "local"
);

const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function main() {
  console.log(bold("\nSync Cursor plugins → ~/.cursor/plugins/local/\n"));

  const entries = fs
    .readdirSync(CURSOR_PLUGINS_SRC, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        fs.existsSync(
          path.join(CURSOR_PLUGINS_SRC, e.name, ".cursor-plugin", "plugin.json")
        )
    );

  if (entries.length === 0) {
    console.log(red("No cursor plugins found in cursor-plugins/"));
    process.exit(1);
  }

  fs.mkdirSync(CURSOR_PLUGINS_DEST, { recursive: true });

  for (const entry of entries) {
    const src = path.join(CURSOR_PLUGINS_SRC, entry.name);
    const dest = path.join(CURSOR_PLUGINS_DEST, entry.name);
    fs.rmSync(dest, { recursive: true, force: true });
    copyDirSync(src, dest);
    console.log(`  ${green("✓")} ${entry.name} ${dim(`→ ${dest}`)}`);
  }

  console.log(
    bold(`\n  ${entries.length} plugin(s) synced. Reload Cursor to pick up changes.\n`)
  );
}

main();
