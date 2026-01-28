# miro-solutions Plugin

Create customer-specific Miro plugins during sales calls. Solution Architects can generate working demo plugins in ~2 minutes.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro-solutions@miro-ai
```

**Prerequisites:**
- `miro` plugin - For Miro MCP tools
- `plugin-dev` plugin - For plugin creation patterns

## Overview

This plugin enables Solution Architects to rapidly create demo plugins that showcase Miro's integration capabilities with a customer's existing tools.

**What it provides:**
1. **Miro Platform Knowledge Skill** - Comprehensive guide to Miro as a platform
2. **Solutions Creator Agent** - SA-focused workflow for plugin generation

## Quick Start

```bash
/miro-solutions:create-plugin
```

## The 3-Question Workflow

The agent asks only 3 questions, then autonomously generates the plugin:

| # | Question | Agent Action |
|---|----------|--------------|
| 1 | **Primary Use Case** | Determines artifacts and command types |
| 2 | **Customer's Tools** | Triggers dynamic MCP research |
| 3 | **Workflow Direction** | Determines which commands to generate |

### Agent Autonomously Decides

Based on your answers, the agent determines:
- **Plugin name** - Derived from primary data source + use case
- **Artifacts** - Based on use case (tables, diagrams, docs, etc.)
- **Commands** - Based on workflow direction (sync, export, dashboard)

### Dynamic MCP Research

When you mention customer tools (e.g., "They use Snowflake and Linear"), the agent:
1. Searches for MCP servers for each tool
2. Reports findings (available vs. needs custom integration)
3. Generates the plugin with appropriate `.mcp.json` configuration

## What Gets Generated

A complete, working plugin:

```
{plugin-name}/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json                  # Miro + discovered MCPs
├── commands/
│   ├── sync.md               # Pull data to Miro
│   ├── visualize.md          # Create diagrams
│   └── export.md             # Push from Miro
├── skills/
│   └── usage-guide/
│       └── SKILL.md          # Usage guide
└── README.md                  # Setup instructions
```

## Use Cases

### Data Visualization
- Pull metrics from customer's data warehouse into Miro tables
- Create dashboards from analytics platforms
- Visualize project data from management tools

### Design-to-Code
- Extract requirements from Miro boards
- Generate code scaffolding from diagrams
- Sync design specs to development tools

### Bidirectional Sync
- Push Miro content to external systems
- Pull external data into Miro
- Keep artifacts synchronized across tools

## Components

### Skill: miro-platform

Comprehensive Miro platform knowledge:
- `content-types.md` - Board content types
- `ai-capabilities.md` - Flows, Sidekicks, AI features
- `design-to-code.md` - Miro Specs workflows
- `enterprise-use-cases.md` - Common patterns

### Agent: solutions-creator

Guided workflow agent with:
- 3-question flow
- Dynamic MCP research
- Autonomous decision making
- Plugin generation from templates

### Templates

Command templates for generated plugins:
- `sync-data.md.tmpl` - Pull data to Miro
- `visualize.md.tmpl` - Create diagrams
- `export.md.tmpl` - Push from Miro
- `dashboard.md.tmpl` - Create dashboards

Plugin scaffolding:
- `plugin.json.tmpl` - Manifest
- `README.md.tmpl` - Setup documentation

## Testing

### Test Skill Availability
```
"What is Miro as a platform?"
"Tell me about Miro content types"
"How does design-to-code work in Miro?"
```

### Test Agent Flow
```
/miro-solutions:create-plugin
```

Walk through all 3 questions and verify the generated plugin.

### Test Generated Plugin
1. Install the generated plugin: `/plugin add ./path/to/generated-plugin`
2. Run the generated commands
3. Verify Miro MCP integration works

## Related

- [miro plugin](miro.md) - Core MCP integration
- [Plugin Development](plugin-development.md) - Build plugins manually
- [Overview](overview.md) - Plugin system introduction
