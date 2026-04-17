import Ajv from "ajv";
import fg from "fast-glob";
import { access, readFile } from "fs/promises";
import path from "path";

import { getCopilotCoworkConfig } from "./copilot-cowork-config";
import manifestSchema from "../schemas/copilot-cowork-manifest.schema.json";

interface CopilotCoworkManifest {
  id: string;
  packageName: string;
  name: {
    short: string;
    full: string;
  };
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
          referenceId?: string;
        };
      };
    };
  }>;
}

interface McpServerConfig {
  url?: string;
  httpUrl?: string;
}

export interface CopilotCoworkValidationResult {
  item: string;
  valid: boolean;
  errors: string[];
}

export interface CopilotCoworkValidationResults {
  hasErrors: boolean;
  results: CopilotCoworkValidationResult[];
}

const ajv = new Ajv({ allErrors: true, strict: false });
const validateManifestSchema = ajv.compile(manifestSchema);

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, "utf-8")) as T;
  } catch {
    return null;
  }
}

function normalizeSkillFolder(folder: string): string {
  return folder.replace(/^\.\/skills\//, "");
}

export async function validateCopilotCoworkPackages(
  root: string
): Promise<CopilotCoworkValidationResults> {
  const results: CopilotCoworkValidationResult[] = [];
  const config = getCopilotCoworkConfig("miro");

  const packageDirs = (
    await fg("copilot-cowork-plugins/*", {
      cwd: root,
      onlyDirectories: true,
    })
  )
    .map((dir) => path.basename(dir))
    .sort();

  const packageDirErrors: string[] = [];
  if (!packageDirs.includes("miro")) {
    packageDirErrors.push('Missing required package directory "copilot-cowork-plugins/miro"');
  }
  for (const dir of packageDirs) {
    if (dir !== "miro") {
      packageDirErrors.push(
        `Unexpected Copilot Cowork package directory "copilot-cowork-plugins/${dir}"`
      );
    }
  }

  results.push({
    item: "copilot-cowork-plugins",
    valid: packageDirErrors.length === 0,
    errors:
      packageDirErrors.length === 0
        ? ['Found expected package directory "copilot-cowork-plugins/miro"']
        : packageDirErrors,
  });

  const packageRoot = path.join(root, "copilot-cowork-plugins", "miro");
  const manifestPath = path.join(packageRoot, "manifest.json");
  const manifestErrors: string[] = [];
  let manifest: CopilotCoworkManifest | null = null;

  if (!(await exists(manifestPath))) {
    manifestErrors.push("Missing manifest.json");
  } else {
    manifest = await readJsonFile<CopilotCoworkManifest>(manifestPath);
    if (!manifest) {
      manifestErrors.push("manifest.json is not valid JSON");
    } else if (!validateManifestSchema(manifest)) {
      manifestErrors.push(
        ...(validateManifestSchema.errors?.map(
          (error) => `${error.instancePath || "root"}: ${error.message}`
        ) ?? [])
      );
    }
  }

  results.push({
    item: "copilot-cowork-plugins/miro/manifest.json",
    valid: manifestErrors.length === 0,
    errors:
      manifestErrors.length === 0
        ? ["manifest.json matches the Copilot Cowork schema"]
        : manifestErrors,
  });

  const identityErrors: string[] = [];
  if (!manifest) {
    identityErrors.push("Cannot validate Copilot identity because manifest.json is invalid");
  } else {
    if (manifest.id !== config.appId) {
      identityErrors.push(
        `Manifest id mismatch: expected "${config.appId}", found "${manifest.id}"`
      );
    }
    if (manifest.packageName !== config.packageName) {
      identityErrors.push(
        `Manifest packageName mismatch: expected "${config.packageName}", found "${manifest.packageName}"`
      );
    }
    if (manifest.name.short !== config.appDisplayName) {
      identityErrors.push(
        `Manifest name.short mismatch: expected "${config.appDisplayName}", found "${manifest.name.short}"`
      );
    }
    if (manifest.name.full !== config.appDisplayName) {
      identityErrors.push(
        `Manifest name.full mismatch: expected "${config.appDisplayName}", found "${manifest.name.full}"`
      );
    }
  }

  results.push({
    item: "copilot-cowork-plugins/miro/identity",
    valid: identityErrors.length === 0,
    errors:
      identityErrors.length === 0
        ? ["Packaged manifest branding and stable identity match the Copilot mapping"]
        : identityErrors,
  });

  const iconErrors: string[] = [];
  for (const iconName of ["color.png", "outline.png"]) {
    if (!(await exists(path.join(packageRoot, iconName)))) {
      iconErrors.push(`Missing ${iconName}`);
    }
  }

  results.push({
    item: "copilot-cowork-plugins/miro/icons",
    valid: iconErrors.length === 0,
    errors:
      iconErrors.length === 0
        ? ["Required package icons are present"]
        : iconErrors,
  });

  const skillsErrors: string[] = [];
  const sourceSkillFiles = await fg("skills/*/SKILL.md", {
    cwd: path.join(root, "claude-plugins", "miro"),
  });
  const expectedSkills = sourceSkillFiles
    .map((file) => path.basename(path.dirname(file)))
    .sort();

  if (!manifest) {
    skillsErrors.push("Cannot validate agentSkills because manifest.json is invalid");
  } else {
    const manifestSkills = manifest.agentSkills
      .map((skill) => normalizeSkillFolder(skill.folder))
      .sort();

    for (const skill of expectedSkills) {
      if (!manifestSkills.includes(skill)) {
        skillsErrors.push(`Missing agentSkills entry for "${skill}"`);
      }
    }
    for (const skill of manifestSkills) {
      if (!expectedSkills.includes(skill)) {
        skillsErrors.push(`Unexpected agentSkills entry for "${skill}"`);
      }
    }

    for (const skill of manifestSkills) {
      const skillPath = path.join(packageRoot, "skills", skill, "SKILL.md");
      if (!(await exists(skillPath))) {
        skillsErrors.push(`Missing packaged skill file "skills/${skill}/SKILL.md"`);
      }
    }
  }

  results.push({
    item: "copilot-cowork-plugins/miro/skills",
    valid: skillsErrors.length === 0,
    errors:
      skillsErrors.length === 0
        ? ["Packaged skills match the source Claude plugin skills"]
        : skillsErrors,
  });

  const connectorErrors: string[] = [];
  const sourceMcp = await readJsonFile<Record<string, McpServerConfig>>(
    path.join(root, "claude-plugins", "miro", ".mcp.json")
  );
  const expectedConnectors = new Map(
    Object.entries(sourceMcp ?? {})
      .map(([serverName, config]) => [serverName, config.httpUrl ?? config.url])
      .filter(([, url]): url is string => Boolean(url))
      .sort(([a], [b]) => a.localeCompare(b))
  );

  if (!manifest) {
    connectorErrors.push(
      "Cannot validate agentConnectors because manifest.json is invalid"
    );
  } else {
    const expectedConnectorConfigs = new Map(
      Object.entries(config.connectors).sort(([a], [b]) => a.localeCompare(b))
    );
    const actualConnectors = new Map(
      (manifest.agentConnectors ?? []).map((connector) => [
        connector.toolSource.remoteMcpServer.mcpServerUrl,
        connector,
      ])
    );

    for (const [serverName, url] of expectedConnectors) {
      const connectorConfig = expectedConnectorConfigs.get(serverName);
      if (!connectorConfig) {
        connectorErrors.push(`Missing Copilot mapping for MCP server "${serverName}"`);
        continue;
      }
      const actualConnector = actualConnectors.get(url);
      if (!actualConnector) {
        connectorErrors.push(`Missing agentConnectors entry for "${serverName}"`);
        continue;
      }
      if (actualConnector.id !== connectorConfig.id) {
        connectorErrors.push(
          `Connector "${serverName}" id mismatch: expected "${connectorConfig.id}", found "${actualConnector.id}"`
        );
      }
      if (actualConnector.displayName !== connectorConfig.displayName) {
        connectorErrors.push(
          `Connector "${serverName}" displayName mismatch: expected "${connectorConfig.displayName}", found "${actualConnector.displayName}"`
        );
      }
      if (actualConnector.description !== connectorConfig.description) {
        connectorErrors.push(
          `Connector "${serverName}" description mismatch: expected "${connectorConfig.description}", found "${actualConnector.description}"`
        );
      }
      if (
        actualConnector.toolSource.remoteMcpServer.authorization.referenceId !==
        connectorConfig.referenceId
      ) {
        connectorErrors.push(
          `Connector "${serverName}" referenceId mismatch: expected "${connectorConfig.referenceId}", found "${actualConnector.toolSource.remoteMcpServer.authorization.referenceId}"`
        );
      }
      if (actualConnector.toolSource.remoteMcpServer.mcpServerUrl !== url) {
        connectorErrors.push(
          `Connector "${serverName}" URL mismatch: expected "${url}", found "${actualConnector.toolSource.remoteMcpServer.mcpServerUrl}"`
        );
      }
    }

    for (const [url, actualConnector] of actualConnectors) {
      if (![...expectedConnectors.values()].includes(url)) {
        connectorErrors.push(`Unexpected agentConnectors entry for "${actualConnector.id}"`);
      }
    }

    for (const serverName of expectedConnectorConfigs.keys()) {
      if (!expectedConnectors.has(serverName)) {
        connectorErrors.push(
          `Unexpected Copilot mapping for MCP server "${serverName}" without a source .mcp.json entry`
        );
      }
    }
  }

  results.push({
    item: "copilot-cowork-plugins/miro/agentConnectors",
    valid: connectorErrors.length === 0,
    errors:
      connectorErrors.length === 0
        ? ["Packaged agentConnectors match the source .mcp.json and Copilot mapping"]
        : connectorErrors,
  });

  return {
    hasErrors: results.some((result) => !result.valid),
    results,
  };
}
