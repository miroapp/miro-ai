# Gemini CLI Extension

Connect Gemini CLI to Miro boards using the MCP extension.

## Overview

The Gemini CLI extension provides Miro MCP integration, enabling Gemini to:

- Read board content and context
- Create diagrams, documents, and tables
- Generate code from board designs

## Extension Files

This repository provides 4 per-plugin extensions in `gemini-extensions/`, each auto-generated from the corresponding Claude plugin via `bun run convert`:

```
gemini-extensions/
├── miro/                # Core MCP integration with commands and skills
├── miro-tasks/          # Task tracking commands and hooks
├── miro-research/       # Research visualization
└── miro-review/         # Code review workflows
```

Each extension contains a `gemini-extension.json` plus any commands (TOML), skills, hooks, and agents from the source Claude plugin. Example (`gemini-extensions/miro/gemini-extension.json`):

```json
{
  "name": "miro",
  "version": "1.0.1",
  "description": "Secure access to Miro boards...",
  "mcpServers": {
    "miro": {
      "httpUrl": "https://mcp.miro.com/",
      "oauth": { "enabled": true },
      "headers": { "X-AI-Source": "gemini-extension" }
    }
  }
}
```

## Installation

**Quick start** — install the root extension for MCP access:

```bash
gemini extensions install https://github.com/miroapp/miro-ai
```

This installs the root `gemini-extension.json`, giving Gemini access to the Miro MCP server (board reading, diagrams, tables, docs). It does **not** install the per-plugin extensions with commands, skills, and hooks.

**Full install** — clone the repo and install individual extensions:

```bash
git clone https://github.com/miroapp/miro-ai.git
gemini extensions install ./miro-ai/gemini-extensions/miro
gemini extensions install ./miro-ai/gemini-extensions/miro-tasks
gemini extensions install ./miro-ai/gemini-extensions/miro-research
gemini extensions install ./miro-ai/gemini-extensions/miro-review
```

Restart Gemini CLI and authenticate when prompted.

For local development, see [CONTRIBUTING.md](../../CONTRIBUTING.md#gemini-cli-extensions).

## Available Extensions

| Extension | Description |
|-----------|-------------|
| miro | Core MCP integration with commands and skills |
| miro-tasks | Task tracking with commands and hooks |
| miro-research | Research visualization |
| miro-review | Code review workflows |

### Authentication

On first use:
1. Gemini will prompt you to authenticate with Miro
2. Sign in to your Miro account
3. Select the team containing your target boards
4. Authorize the connection

## Available Capabilities

The extension provides access to all Miro MCP tools:

### Content Creation
- Create flowcharts, mind maps, UML diagrams
- Generate markdown documents on boards
- Create tables with typed columns

### Content Reading
- List board items by type
- Extract documentation from frames
- Read table data with filtering

### Context Extraction
- Generate project summaries
- Extract design specifications
- Get technical requirements

## Usage Examples

Once configured, you can interact with Miro boards:

```
# Create a diagram
"Create a flowchart on https://miro.com/app/board/abc= showing the user registration process"

# Read board content
"What's on my Miro board https://miro.com/app/board/abc=?"

# Generate documentation
"Extract the design requirements from the wireframes on my Miro board"
```

## Configuration Fields

| Field | Description |
|-------|-------------|
| `name` | Extension display name |
| `version` | Extension version |
| `description` | What the extension provides |
| `mcpServers` | MCP server configurations |

### MCP Server Fields

| Field | Description |
|-------|-------------|
| `httpUrl` | MCP server endpoint |
| `oauth.enabled` | Enable OAuth authentication |
| `headers` | Custom HTTP headers |

## Differences from Claude Code

| Feature | Gemini CLI | Claude Code |
|---------|------------|-------------|
| Configuration | JSON extension file | Plugin system |
| Commands | TOML commands (converted) | Markdown slash commands |
| Skills | Knowledge skills (converted) | Knowledge skills |
| Automation | Hooks (converted) | Hooks and agents |

Gemini extensions are auto-generated from Claude plugins via `bun run convert`. Some advanced features may differ. See [Claude Code](../claude-code/overview.md) for the canonical plugin source.

## Troubleshooting

### Authentication Issues

- Ensure OAuth is enabled in your configuration
- Try re-authenticating if tokens expire
- Verify you selected the correct team

### Connection Issues

- Check network access to `https://mcp.miro.com/`
- Verify the extension file is valid JSON
- Ensure Gemini CLI supports MCP extensions

## Related

- [MCP Setup Guide](../getting-started/mcp-setup.md) - General MCP configuration
- [Tools Reference](../mcp/tools-reference.md) - Available MCP tools
- [Tutorials](../mcp/tutorials.md) - Example workflows
