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

export function syncCursorPlugins(
  srcDir: string = CURSOR_PLUGINS_SRC,
  destDir: string = CURSOR_PLUGINS_DEST,
  pluginNames?: string[]
) {
  console.log(bold(`\nSync Cursor plugins → ${destDir}/\n`));

  if (!fs.existsSync(srcDir)) {
    throw new Error(`Source directory not found: ${srcDir}`);
  }

  const entries = fs
    .readdirSync(srcDir, { withFileTypes: true })
    .filter(
      (e) =>
        e.isDirectory() &&
        (!pluginNames || pluginNames.includes(e.name)) &&
        fs.existsSync(
          path.join(srcDir, e.name, ".cursor-plugin", "plugin.json")
        )
    );

  if (entries.length === 0) {
    const filterMsg = pluginNames ? ` matching ${JSON.stringify(pluginNames)}` : "";
    throw new Error(`No cursor plugins found in ${srcDir}${filterMsg}`);
  }

  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of entries) {
    const src = path.join(srcDir, entry.name);
    const dest = path.join(destDir, entry.name);
    fs.rmSync(dest, { recursive: true, force: true });
    copyDirSync(src, dest);
    console.log(`  ${green("✓")} ${entry.name} ${dim(`→ ${dest}`)}`);
  }

  console.log(
    bold(`\n  ${entries.length} plugin(s) synced. Reload Cursor to pick up changes.\n`)
  );
  return entries.length;
}

export { CURSOR_PLUGINS_SRC, CURSOR_PLUGINS_DEST };

if (import.meta.main) {
  syncCursorPlugins();
}
