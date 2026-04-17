export interface CopilotCoworkConnectorConfig {
  id: string;
  displayName: string;
  description: string;
  referenceId?: string;
}

export interface CopilotCoworkPluginConfig {
  appDisplayName: string;
  packageName: string;
  appId: string;
  connectors: Record<string, CopilotCoworkConnectorConfig>;
}

// Copilot branding is allowed to differ from the source Claude plugin key,
// but the generated package identity must stay stable across rebuilds.
const COPILOT_COWORK_CONFIG: Record<string, CopilotCoworkPluginConfig> = {
  miro: {
    appDisplayName: "Miro Cowork",
    packageName: "com.cowork.plugin.miro",
    appId: "1b72f048-929d-554f-9995-9bc8e90f4c4f",
    connectors: {
      miro: {
        id: "miro",
        displayName: "Miro Cowork MCP Server",
        description: "Remote MCP server providing tools for Miro Cowork",
        referenceId: "miro-miro-auth",
      },
    },
  },
};

export function getCopilotCoworkConfig(
  pluginName: string
): CopilotCoworkPluginConfig {
  const config = COPILOT_COWORK_CONFIG[pluginName];
  if (!config) {
    throw new Error(`No Copilot Cowork config defined for plugin "${pluginName}"`);
  }

  return config;
}
