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
      short: "Turn Miro boards into diagrams, docs, tables, and code — securely.",
      full:
        "Miro for Microsoft 365 Copilot connects your Miro boards to Copilot so you can read, summarize, and transform board content directly from chat — without leaving your flow of work.\n\nPoint Copilot at any Miro board URL and it can extract the structure and content of the board, turn it into polished deliverables, or generate working code from your designs. All access runs through Miro's OAuth-secured MCP server, so Copilot only sees boards the signed-in user already has permission to view.\n\nWhat you can do\n\n- Summarize boards - Get a concise summary of a brainstorm, retro, workshop, or research board in seconds.\n- Generate diagrams - Create flowcharts, mind maps, UML, Mermaid, and PlantUML diagrams on a board from a prompt or from existing content.\n- Create documents - Produce PRDs, specs, meeting notes, and documentation from sticky notes, frames, and cards on a board.\n- Build tables - Turn board content into structured tables (roadmaps, status trackers, comparison matrices, task lists).\n- Browse board context - Pull frames, shapes, connectors, images, and stickies into Copilot as context for any downstream task.\n- Design to code - Generate code scaffolds, components, or prototypes from wireframes and design artifacts on a board.\n\nCommands included\n\n- browse - Explore and extract content from a board\n- summarize - Summarize a board or a specific frame\n- diagram - Create or update diagrams on a board\n- doc - Generate a document from board content\n- table - Create a structured table from board content\n\nWho it's for\n\nProduct managers turning workshop output into PRDs, engineers generating diagrams and code from design boards, designers syncing specs back to boards, and any team that runs planning, discovery, or retros in Miro and wants Copilot to do the heavy lifting.\n\nSecurity and privacy\n\nAuthentication uses Miro OAuth. Copilot can only access boards the signed-in user is authorized to view, and respects all existing Miro team, board, and sharing permissions. No board content is stored outside the Miro and Microsoft 365 boundary.\n\nRequirements\n\nA Miro account with access to the boards you want to use. Sign in with Miro on first use to authorize the connection.",
    },
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
