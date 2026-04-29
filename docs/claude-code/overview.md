# Claude Code Plugins

Claude Code plugins extend Claude's capabilities with slash commands, skills, agents, and hooks for Miro integration.

## What are Claude Code Plugins?

Plugins are packages that add specialized functionality to Claude Code:

- **Skills** - Task-shaped knowledge that auto-loads based on the user's prompt (e.g. `miro-diagram` activates when the user asks to draw something on a board)
- **MCP** - Bundled MCP server configuration so Claude can talk to Miro directly

## Why Use Plugins vs Direct MCP?

| Feature | Direct MCP | Plugins |
|---------|------------|---------|
| Setup | Manual JSON config | One command install |
| Guidance | Generic tool use | Skills auto-load best practices for each task |

Plugins provide a higher-level experience on top of raw MCP tools.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

Restart Claude Code after installation.

For local development, see [CONTRIBUTING.md](../../CONTRIBUTING.md#claude-code-plugins).

## Available Plugins

| Plugin | Description | Surface |
|--------|-------------|---------|
| [miro](miro.md) | Core MCP integration | Skills: `miro-browse`, `miro-code-review`, `miro-code-spec`, `miro-diagram`, `miro-doc`, `miro-table` |

## Quick Start

After installing the `miro` plugin, prompt Claude in natural language with a board URL — the relevant skill loads automatically:

```
# Create a diagram on a Miro board
create a flowchart for the user authentication flow on https://miro.com/app/board/abc=

# Create a document
add a meeting-notes doc with action items to https://miro.com/app/board/abc=

# Browse board contents
list items on https://miro.com/app/board/abc=
```

## Authentication

On first use, you'll be prompted to authenticate with Miro via OAuth. Select the team containing your target boards.

## Next Steps

- [miro plugin](miro.md) - Core skills and MCP integration
- [Plugin Development](plugin-development.md) - Build your own plugins
