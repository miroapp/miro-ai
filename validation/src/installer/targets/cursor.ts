import fs from "fs";
import os from "os";
import path from "path";
import {
  GITHUB_URL,
  PLUGIN_NAME,
  type Source,
  type Target,
  c,
  exec,
} from "../index.ts";
import { syncCursorPlugins } from "../../sync-cursor.ts";

const CURSOR_LOCAL_DIR = path.join(os.homedir(), ".cursor", "plugins", "local");

function removeInstalled(): void {
  const dest = path.join(CURSOR_LOCAL_DIR, PLUGIN_NAME);
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
    console.log(`  ${c.green("✓")} removed ${dest}`);
  } else {
    console.log(`  ${c.dim("·")} nothing to remove at ${dest}`);
  }
}

export const cursorTarget: Target = {
  name: "cursor",
  bin: null,
  async install(source: Source, repoRoot: string) {
    removeInstalled();

    if (source === "local") {
      const src = path.join(repoRoot, "cursor-plugins");
      const synced = syncCursorPlugins(src, CURSOR_LOCAL_DIR, [PLUGIN_NAME]);
      if (synced !== 1) {
        throw new Error(`cursor: expected to install 1 plugin, synced ${synced}`);
      }
      return;
    }

    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "miro-cursor-"));
    try {
      await exec("git", ["clone", "--depth", "1", GITHUB_URL, tmpRoot]);
      const src = path.join(tmpRoot, "cursor-plugins");
      const synced = syncCursorPlugins(src, CURSOR_LOCAL_DIR, [PLUGIN_NAME]);
      if (synced !== 1) {
        throw new Error(`cursor: expected to install 1 plugin from clone, synced ${synced}`);
      }
    } finally {
      fs.rmSync(tmpRoot, { recursive: true, force: true });
    }
  },
  async uninstall() {
    removeInstalled();
  },
};
