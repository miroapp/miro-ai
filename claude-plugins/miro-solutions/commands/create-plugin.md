---
description: Create a custom Miro plugin for a customer during a sales call
---

# Create Customer Plugin

Create a customer-specific Miro plugin during a sales call. This command launches the solutions-creator agent which guides you through **3 quick questions** to gather requirements, researches MCP availability for the customer's tools, and generates a complete plugin.

## Prerequisites

This workflow requires:
- `miro` plugin - For Miro MCP tools
- `plugin-dev` plugin - For plugin creation patterns

## What Happens

### 1. Gather Requirements (~1-2 minutes, 3 questions)

| # | Question | Agent Action |
|---|----------|--------------|
| 1 | Primary use case | Determines artifacts and command types |
| 2 | Customer's tools | Triggers dynamic MCP research |
| 3 | Workflow direction | Determines which commands to generate |

### 2. Agent Autonomously Decides

- **Plugin name** - Derived from primary data source + use case
- **Artifacts** - Based on use case (tables, diagrams, docs, etc.)
- **Commands** - Based on workflow direction (sync, export, dashboard)

### 3. Research MCPs

- Searches for MCP servers for each mentioned tool
- Reports findings (available vs. needs custom integration)
- Generates MCP configuration automatically

### 4. Generate Plugin

Creates complete plugin directory structure:

```
{plugin-name}/
├── .claude-plugin/plugin.json
├── .mcp.json
├── commands/
├── skills/
└── README.md
```

## Examples

**Start the workflow:**
```
/miro-solutions:create-plugin
```

The agent will ask:
1. "What does the customer want to accomplish with AI + Miro?"
2. "What tools and systems does the customer use for their data?"
3. "What's the main flow?" (Pull to Miro / Push from Miro / Bidirectional)

## Tips for Sales Calls

- Run this during the call to create a working demo in real-time
- Keep the customer's tool list handy (ask beforehand if possible)
- The generated README includes credential setup - walk through this together
- Plugin name is auto-generated but can be renamed after generation

## Workflow

Invoke the `solutions-creator` agent to run the guided workflow.
