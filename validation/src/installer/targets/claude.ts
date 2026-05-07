import {
  GITHUB_OWNER_REPO,
  MARKETPLACE_NAME,
  PLUGIN_NAME,
  type Source,
  type Target,
  exec,
  execAllowing,
} from "../index.ts";

const BIN = "claude";

const TOLERABLE_ABSENT = [
  /Plugin .* not found in installed plugins/i,
  /Marketplace .* not found/i,
];

async function cleanInstalled(): Promise<void> {
  await execAllowing(BIN, ["plugin", "uninstall", `${PLUGIN_NAME}@${MARKETPLACE_NAME}`], TOLERABLE_ABSENT);
  await execAllowing(BIN, ["plugin", "marketplace", "remove", MARKETPLACE_NAME], TOLERABLE_ABSENT);
}

export const claudeTarget: Target = {
  name: "claude",
  bin: BIN,
  async install(source: Source, repoRoot: string) {
    await cleanInstalled();
    const marketplaceSource = source === "local" ? repoRoot : GITHUB_OWNER_REPO;
    await exec(BIN, ["plugin", "marketplace", "add", marketplaceSource]);
    await exec(BIN, ["plugin", "install", `${PLUGIN_NAME}@${MARKETPLACE_NAME}`, "-s", "user"]);
  },
  async uninstall() {
    await cleanInstalled();
  },
};
