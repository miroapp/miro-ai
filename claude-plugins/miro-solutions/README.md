# Solutions Dev Plugin

Create customer-specific Miro plugins during sales calls.

## Overview

This plugin enables Solution Architects to rapidly create demo plugins that showcase Miro's integration capabilities with a customer's existing tools. In ~2 minutes, generate a working plugin customized for the customer.

## How It Works

| Plugin | Purpose | What it provides |
|--------|---------|------------------|
| `miro` (required) | Miro MCP integration | MCP tools, commands for diagrams/tables/docs |
| `plugin-dev` (required) | General plugin creation | Plugin creation workflow, validation |
| **`miro-solutions`** | GTM enablement | Miro Platform knowledge + SA-focused agent |

**This plugin adds:**
1. **Miro Platform Knowledge Skill** - Comprehensive guide to Miro as a platform (canvas features, AI capabilities, enterprise use cases)
2. **Solutions Creator Agent** - SA-focused workflow that orchestrates existing plugins + dynamic MCP research

## Prerequisites

Install the required companion plugins:
- `miro` plugin - For Miro MCP tools
- `plugin-dev` plugin - For plugin creation patterns

## Quick Start

```bash
# Start the guided plugin creation workflow
/miro-solutions:create-plugin
```

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

## The Workflow (~1-2 minutes)

The agent asks only **3 questions**, then autonomously generates the plugin:

| # | Question | Agent Action |
|---|----------|--------------|
| 1 | **Primary Use Case** | Determines artifacts and command types |
| 2 | **Customer's Tools** | Triggers dynamic MCP research |
| 3 | **Workflow Direction** | Determines which commands to generate |

### Agent Autonomously Decides

- **Plugin name** - Derived from primary data source + use case
- **Artifacts** - Based on use case (tables, diagrams, docs, etc.)
- **Commands** - Based on workflow direction (sync, export, dashboard)

### Dynamic MCP Research

When you mention customer tools (e.g., "They use Snowflake and Linear"), the agent:
1. Searches for MCP servers for each tool
2. Reports findings (available vs. needs custom integration)
3. Proceeds to generate the plugin with appropriate `.mcp.json` configuration

## Components

### Skill: miro-platform

Comprehensive Miro platform knowledge:
- `skills/miro-platform/SKILL.md` - Core overview
- `skills/miro-platform/references/content-types.md` - Board content types
- `skills/miro-platform/references/ai-capabilities.md` - Flows, Sidekicks, AI features
- `skills/miro-platform/references/design-to-code.md` - Miro Specs workflows
- `skills/miro-platform/references/enterprise-use-cases.md` - Common patterns

### Agent: solutions-creator

Guided workflow agent with:
- 3-question flow
- Dynamic MCP research
- Autonomous decision making
- Plugin generation from templates

### Command: create-plugin

Entry point: `/miro-solutions:create-plugin`

### Templates

Command templates for generated plugins:
- `templates/commands/sync-data.md.tmpl` - Pull data to Miro
- `templates/commands/visualize.md.tmpl` - Create diagrams
- `templates/commands/export.md.tmpl` - Push from Miro
- `templates/commands/dashboard.md.tmpl` - Create dashboards

Plugin scaffolding templates:
- `templates/plugin/plugin.json.tmpl` - Manifest
- `templates/plugin/README.md.tmpl` - Setup documentation

## Directory Structure

```
miro-solutions/
├── .claude-plugin/
│   └── plugin.json
├── agents/
│   └── solutions-creator.md
├── commands/
│   └── create-plugin.md
├── skills/
│   └── miro-platform/
│       ├── SKILL.md
│       └── references/
│           ├── content-types.md
│           ├── ai-capabilities.md
│           ├── design-to-code.md
│           └── enterprise-use-cases.md
├── templates/
│   ├── commands/
│   │   ├── sync-data.md.tmpl
│   │   ├── visualize.md.tmpl
│   │   ├── export.md.tmpl
│   │   └── dashboard.md.tmpl
│   └── plugin/
│       ├── plugin.json.tmpl
│       └── README.md.tmpl
└── README.md
```

## Testing

### Test skill availability
```
"What is Miro as a platform?"
"Tell me about Miro content types"
"How does design-to-code work in Miro?"
```

### Test agent flow
```
/miro-solutions:create-plugin
```
Walk through all 3 questions and verify the generated plugin.

### Test generated plugin
1. Install the generated plugin
2. Run the generated commands
3. Verify Miro MCP integration works

## License

MIT
