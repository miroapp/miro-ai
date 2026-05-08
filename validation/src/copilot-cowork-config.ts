export interface CopilotCoworkConnectorConfig {
  id: string;
  displayName: string;
  description: string;
  referenceId?: string;
}

export interface CopilotCoworkPluginConfig {
  appDisplayName: string;
  appDescription: {
    short: string;
    full: string;
  };
  packageName: string;
  appId: string;
  connectors: Record<string, CopilotCoworkConnectorConfig>;
}

// Copilot branding is allowed to differ from the source Claude plugin key,
// but the generated package identity must stay stable across rebuilds.
const COPILOT_COWORK_CONFIG: Record<string, CopilotCoworkPluginConfig> = {
  miro: {
    appDisplayName: "Miro Cowork",
    appDescription: {
      short: "Create layouts, add content, and act on Miro boards from chat.",
      full:
        "Miro Cowork connects Miro to Microsoft 365 Copilot so you can create, understand, and act on boards directly from chat.\n\nGo beyond summarizing existing boards: create new boards, build structured layouts with frames, sticky notes, shapes, text, cards, docs, and tables, add images from URLs, generate diagrams, read and resolve comments, and turn team discussion into clear next steps on the canvas.\n\nUse it to run retros, compare user journeys, map workflows, capture action items, review product specs, create implementation context, and close the loop on board feedback without leaving Copilot.\n\nMiro Cowork uses Miro OAuth and respects the signed-in user's existing Miro permissions, so Copilot can only access boards the user is authorized to view.\n\nRequirements: a Miro account with access to the boards you want to use.",
    },
    packageName: "com.cowork.plugin.miro",
    appId: "1b72f048-929d-554f-9995-9bc8e90f4c4f",
    connectors: {
      miro: {
        id: "miro",
        displayName: "Miro Cowork MCP Server",
        description: "Remote MCP server providing tools for Miro Cowork",
        referenceId:
          "MWZhMjgyNjUtNGZkOC00ZTVlLTg4ZjItYmU4ODgzNjkxZTNiIyM4NjA2NzZiNy0yNmJmLTRlN2YtOTczNC03YmJmYjIzN2ExOGM=",
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
