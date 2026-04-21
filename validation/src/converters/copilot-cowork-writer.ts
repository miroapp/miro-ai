import { cp, mkdir, readFile, rm, writeFile } from "fs/promises";
import fg from "fast-glob";
import path from "path";
import {
  getCopilotCoworkConfig,
  type CopilotCoworkPluginConfig,
} from "../copilot-cowork-config";
import type {
  ClaudePlugin,
  ConversionResult,
  ConversionWarning,
} from "./types";

const COWORK_SCHEMA_URL =
  "https://developer.microsoft.com/json-schemas/teams/vDevPreview/MicrosoftTeams.schema.json";
const COWORK_ASSETS_ROOT = path.join(process.cwd(), "assets", "copilot-cowork");
const DEFAULT_PRIVACY_URL = "https://miro.com/legal/privacy-policy/";
const DEFAULT_TERMS_URL = "https://miro.com/legal/terms-of-service/";
const DEFAULT_ACCENT_COLOR = "#4A90D9";

interface CopilotCoworkManifest {
  $schema: string;
  manifestVersion: "devPreview";
  version: string;
  id: string;
  packageName: string;
  developer: {
    name: string;
    websiteUrl: string;
    privacyUrl: string;
    termsOfUseUrl: string;
  };
  name: {
    short: string;
    full: string;
  };
  description: {
    short: string;
    full: string;
  };
  icons: {
    color: "color.png";
    outline: "outline.png";
  };
  accentColor: string;
  agentSkills: Array<{
    folder: string;
  }>;
  agentConnectors?: Array<{
    id: string;
    displayName: string;
    description: string;
    toolSource: {
      remoteMcpServer: {
        mcpServerUrl: string;
        authorization: {
          type: "None" | "OAuthPluginVault" | "ApiKeyPluginVault";
          referenceId?: string;
        };
      };
    };
  }>;
}

function buildSkillFolders(plugin: ClaudePlugin): string[] {
  return [...new Set(plugin.skills.map((skill) => path.basename(path.dirname(skill.relPath))))]
    .sort();
}

function getCoworkAssetDir(plugin: ClaudePlugin): string {
  return path.join(COWORK_ASSETS_ROOT, plugin.dirName);
}

async function readExistingManifest(
  manifestPath: string
): Promise<CopilotCoworkManifest | null> {
  try {
    return JSON.parse(await readFile(manifestPath, "utf-8")) as CopilotCoworkManifest;
  } catch {
    return null;
  }
}

function findExistingConnector(
  existingManifest: CopilotCoworkManifest | null,
  serverName: string,
  serverUrl: string,
  configuredId: string
) {
  return existingManifest?.agentConnectors?.find((connector) => {
    const existingUrl = connector.toolSource.remoteMcpServer.mcpServerUrl;
    return (
      existingUrl === serverUrl ||
      connector.id === configuredId ||
      connector.id === serverName
    );
  });
}

function buildAgentConnectors(
  plugin: ClaudePlugin,
  warnings: ConversionWarning[],
  config: CopilotCoworkPluginConfig,
  existingManifest: CopilotCoworkManifest | null
): CopilotCoworkManifest["agentConnectors"] {
  if (!plugin.mcp) return undefined;

  const connectors = Object.entries(plugin.mcp)
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([serverName, server]) => {
      const serverUrl = server.httpUrl ?? server.url;
      if (!serverUrl) {
        warnings.push({
          plugin: plugin.dirName,
          message: `Skipping MCP server "${serverName}" because no URL was found`,
        });
        return [];
      }

      const connectorConfig = config.connectors[serverName];
      if (!connectorConfig) {
        throw new Error(
          `No Copilot Cowork connector config defined for plugin "${plugin.dirName}" server "${serverName}"`
        );
      }

      const authType = resolveAuthType(serverUrl);
      const existingConnector = findExistingConnector(
        existingManifest,
        serverName,
        serverUrl,
        connectorConfig.id
      );
      const authorization: {
        type: "None" | "OAuthPluginVault" | "ApiKeyPluginVault";
        referenceId?: string;
      } = { type: authType };

      if (authType !== "None") {
        authorization.referenceId =
          existingConnector?.toolSource.remoteMcpServer.authorization.referenceId ??
          connectorConfig.referenceId;
      }

      return [
        {
          id: existingConnector?.id ?? connectorConfig.id,
          displayName: connectorConfig.displayName,
          description: connectorConfig.description,
          toolSource: {
            remoteMcpServer: {
              mcpServerUrl: serverUrl,
              authorization,
            },
          },
        },
      ];
    });

  return connectors.length > 0 ? connectors : undefined;
}

function resolveAuthType(
  serverUrl: string
): "None" | "OAuthPluginVault" | "ApiKeyPluginVault" {
  if (
    /^https:\/\//i.test(serverUrl) &&
    !/localhost|127\.0\.0\.1/i.test(serverUrl)
  ) {
    return "OAuthPluginVault";
  }

  return "None";
}

function buildManifest(
  plugin: ClaudePlugin,
  skillFolders: string[],
  warnings: ConversionWarning[],
  config: CopilotCoworkPluginConfig,
  existingManifest: CopilotCoworkManifest | null
): CopilotCoworkManifest {
  const pluginVersion = plugin.manifest.version ?? "1.0.0";

  const manifest: CopilotCoworkManifest = {
    $schema: COWORK_SCHEMA_URL,
    manifestVersion: "devPreview",
    version: pluginVersion,
    id: existingManifest?.id ?? config.appId,
    packageName: existingManifest?.packageName ?? config.packageName,
    developer: {
      name: plugin.manifest.author?.name ?? "Miro",
      websiteUrl: plugin.manifest.homepage ?? "https://miro.com",
      privacyUrl: DEFAULT_PRIVACY_URL,
      termsOfUseUrl: DEFAULT_TERMS_URL,
    },
    name: {
      short: config.appDisplayName.slice(0, 30),
      full: config.appDisplayName.slice(0, 100),
    },
    description: {
      short: config.appDescription.short,
      full: config.appDescription.full,
    },
    icons: {
      color: "color.png",
      outline: "outline.png",
    },
    accentColor: DEFAULT_ACCENT_COLOR,
    agentSkills: skillFolders.map((folder) => ({
      folder: `./skills/${folder}`,
    })),
  };

  const agentConnectors = buildAgentConnectors(
    plugin,
    warnings,
    config,
    existingManifest
  );
  if (agentConnectors) {
    manifest.agentConnectors = agentConnectors;
  }

  return manifest;
}

export async function writeCopilotCoworkPlugin(
  plugin: ClaudePlugin,
  outputDir: string,
  dryRun: boolean
): Promise<ConversionResult> {
  const warnings: ConversionWarning[] = [];
  const errors: string[] = [];
  const filesWritten: string[] = [];
  const pluginDir = path.join(outputDir, plugin.dirName);
  const assetDir = getCoworkAssetDir(plugin);
  const manifestPath = path.join(pluginDir, "manifest.json");
  const config = getCopilotCoworkConfig(plugin.dirName);

  const skillFolders = buildSkillFolders(plugin);
  if (skillFolders.length === 0) {
    errors.push(`Plugin "${plugin.dirName}" has no skills to package`);
    return {
      plugin: plugin.dirName,
      target: "copilot-cowork",
      success: false,
      filesWritten,
      warnings,
      errors,
    };
  }

  async function writeJson(relPath: string, content: unknown) {
    const fullPath = path.join(pluginDir, relPath);
    filesWritten.push(path.relative(outputDir, fullPath));
    if (!dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await writeFile(fullPath, JSON.stringify(content, null, 2) + "\n", "utf-8");
    }
  }

  async function copyFileToOutput(sourcePath: string, relPath: string) {
    const fullPath = path.join(pluginDir, relPath);
    filesWritten.push(path.relative(outputDir, fullPath));
    if (!dryRun) {
      await mkdir(path.dirname(fullPath), { recursive: true });
      await cp(sourcePath, fullPath, { force: true });
    }
  }

  async function copyRelativeFile(relPath: string) {
    await copyFileToOutput(path.join(plugin.absPath, relPath), relPath);
  }

  async function copyRelativeGlob(pattern: string) {
    const relPaths = await fg(pattern, {
      cwd: plugin.absPath,
      onlyFiles: true,
      dot: true,
    });

    for (const relPath of relPaths.sort()) {
      await copyRelativeFile(relPath);
    }
  }

  try {
    const existingManifest = dryRun ? null : await readExistingManifest(manifestPath);
    const colorIconPath = path.join(assetDir, "color.png");
    const outlineIconPath = path.join(assetDir, "outline.png");
    const iconFiles = await fg(["color.png", "outline.png"], {
      cwd: assetDir,
      onlyFiles: true,
    });

    if (!iconFiles.includes("color.png")) {
      errors.push(`Missing required icon: ${colorIconPath}`);
    }
    if (!iconFiles.includes("outline.png")) {
      errors.push(`Missing required icon: ${outlineIconPath}`);
    }
    if (errors.length > 0) {
      throw new Error("Required Copilot Cowork icons are missing");
    }

    if (!dryRun) {
      await rm(pluginDir, { recursive: true, force: true });
    }

    const manifest = buildManifest(
      plugin,
      skillFolders,
      warnings,
      config,
      existingManifest
    );
    await writeJson("manifest.json", manifest);
    await copyFileToOutput(colorIconPath, "color.png");
    await copyFileToOutput(outlineIconPath, "outline.png");
    await copyRelativeGlob("skills/**/*");
    await copyRelativeGlob("commands/**/*");
  } catch (e) {
    if (!errors.some((error) => error.includes("Missing required icon"))) {
      errors.push(`Failed to write Copilot Cowork package: ${(e as Error).message}`);
    }
  }

  return {
    plugin: plugin.dirName,
    target: "copilot-cowork",
    success: errors.length === 0,
    filesWritten,
    warnings,
    errors,
  };
}
