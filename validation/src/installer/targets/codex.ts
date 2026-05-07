import {
  GITHUB_URL,
  MARKETPLACE_NAME,
  type Source,
  type Target,
  exec,
  execAllowing,
} from "../index.ts";

const BIN = "codex";

const TOLERABLE_ABSENT = [/marketplace .* is not configured or installed/i];

async function cleanInstalled(): Promise<void> {
  await execAllowing(BIN, ["plugin", "marketplace", "remove", MARKETPLACE_NAME], TOLERABLE_ABSENT);
}

export const codexTarget: Target = {
  name: "codex",
  bin: BIN,
  async install(source: Source, repoRoot: string) {
    await cleanInstalled();
    const src = source === "local" ? repoRoot : GITHUB_URL;
    await exec(BIN, ["plugin", "marketplace", "add", src]);
  },
  async uninstall() {
    await cleanInstalled();
  },
};
