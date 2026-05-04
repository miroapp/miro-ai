import {
  GITHUB_URL,
  PLUGIN_NAME,
  type Source,
  type Target,
  exec,
  execAllowing,
} from "../index.ts";

const BIN = "gemini";

const TOLERABLE_ABSENT = [/Extension not found/i];

async function cleanInstalled(): Promise<void> {
  await execAllowing(BIN, ["extensions", "uninstall", PLUGIN_NAME], TOLERABLE_ABSENT);
}

export const geminiTarget: Target = {
  name: "gemini",
  bin: BIN,
  async install(source: Source, repoRoot: string) {
    await cleanInstalled();
    if (source === "local") {
      await exec(BIN, ["extensions", "link", repoRoot, "--consent"]);
    } else {
      await exec(BIN, ["extensions", "install", GITHUB_URL, "--consent"]);
    }
  },
  async uninstall() {
    await cleanInstalled();
  },
};
