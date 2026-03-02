import { readFile } from "fs/promises";
import { execa } from "execa";
import path from "path";

export interface VersionResult {
  check: string;
  valid: boolean;
  details: string[];
}

export interface VersionResults {
  hasErrors: boolean;
  results: VersionResult[];
}

interface PluginJson {
  name?: string;
  version?: string;
}

interface MarketplaceJson {
  plugins?: { name: string; version: string; source: string }[];
}

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

async function getMainRef(): Promise<string | null> {
  for (const ref of ["origin/main", "main"]) {
    try {
      await execa("git", ["rev-parse", "--verify", ref]);
      return ref;
    } catch {
      // try next
    }
  }
  return null;
}

async function getChangedFiles(mainRef: string): Promise<string[]> {
  const { stdout } = await execa("git", ["diff", mainRef, "--name-only"]);
  return stdout.split("\n").filter(Boolean);
}

async function getMainVersion(
  mainRef: string,
  pluginJsonPath: string
): Promise<string | null> {
  try {
    const { stdout } = await execa("git", [
      "show",
      `${mainRef}:${pluginJsonPath}`,
    ]);
    const data = JSON.parse(stdout) as PluginJson;
    return data.version ?? null;
  } catch {
    return null; // new plugin, doesn't exist on main
  }
}

export async function checkVersions(root: string): Promise<VersionResults> {
  const results: VersionResult[] = [];

  // Resolve main branch ref
  const mainRef = await getMainRef();
  if (!mainRef) {
    results.push({
      check: "Version bump check",
      valid: true,
      details: [
        "Warning: Could not resolve origin/main or main — skipping version check",
      ],
    });
    return { hasErrors: false, results };
  }

  // Get changed files relative to main
  let changedFiles: string[];
  try {
    changedFiles = await getChangedFiles(mainRef);
  } catch {
    results.push({
      check: "Version bump check",
      valid: true,
      details: [
        "Warning: Could not diff against main — skipping version check",
      ],
    });
    return { hasErrors: false, results };
  }

  // Extract affected plugin names from changed file paths
  const affectedPlugins = new Set<string>();
  for (const file of changedFiles) {
    const match = file.match(/^claude-plugins\/([^/]+)\//);
    if (match) {
      affectedPlugins.add(match[1]);
    }
  }

  if (affectedPlugins.size === 0) {
    results.push({
      check: "Version bump check",
      valid: true,
      details: ["No plugin directories changed"],
    });
    return { hasErrors: false, results };
  }

  // Check each affected plugin's version
  let hasErrors = false;
  for (const pluginName of affectedPlugins) {
    const pluginJsonRel = `claude-plugins/${pluginName}/.claude-plugin/plugin.json`;
    const pluginJsonAbs = path.join(root, pluginJsonRel);

    let currentVersion: string;
    try {
      const content = await readFile(pluginJsonAbs, "utf-8");
      const data = JSON.parse(content) as PluginJson;
      currentVersion = data.version ?? "0.0.0";
    } catch {
      results.push({
        check: `Version bump: ${pluginName}`,
        valid: true,
        details: ["No plugin.json found — skipping"],
      });
      continue;
    }

    const mainVersion = await getMainVersion(mainRef, pluginJsonRel);
    if (mainVersion === null) {
      results.push({
        check: `Version bump: ${pluginName}`,
        valid: true,
        details: [`New plugin (not on ${mainRef}) — skipping`],
      });
      continue;
    }

    if (compareSemver(currentVersion, mainVersion) <= 0) {
      results.push({
        check: `Version bump: ${pluginName}`,
        valid: false,
        details: [
          `Plugin '${pluginName}' has changes but version not bumped (current: ${currentVersion}, main: ${mainVersion})`,
        ],
      });
      hasErrors = true;
    } else {
      results.push({
        check: `Version bump: ${pluginName}`,
        valid: true,
        details: [`${mainVersion} → ${currentVersion}`],
      });
    }
  }

  // Cross-check marketplace.json versions against plugin.json versions
  const marketplacePath = path.join(root, ".claude-plugin/marketplace.json");
  try {
    const content = await readFile(marketplacePath, "utf-8");
    const marketplace = JSON.parse(content) as MarketplaceJson;

    for (const entry of marketplace.plugins ?? []) {
      const pluginJsonRel = `claude-plugins/${entry.name}/.claude-plugin/plugin.json`;
      const pluginJsonAbs = path.join(root, pluginJsonRel);

      try {
        const pluginContent = await readFile(pluginJsonAbs, "utf-8");
        const pluginData = JSON.parse(pluginContent) as PluginJson;
        const pluginVersion = pluginData.version ?? "0.0.0";

        if (entry.version !== pluginVersion) {
          results.push({
            check: `Marketplace version: ${entry.name}`,
            valid: false,
            details: [
              `marketplace.json has ${entry.version} but plugin.json has ${pluginVersion}`,
            ],
          });
          hasErrors = true;
        }
      } catch {
        // plugin.json doesn't exist — other validators handle this
      }
    }
  } catch {
    // no marketplace.json — skip cross-check
  }

  return { hasErrors, results };
}
