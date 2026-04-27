# Claude Code Plugins

Claude Code plugins extend Claude's capabilities with slash commands, skills, agents, and hooks for Miro integration.

## What are Claude Code Plugins?

Plugins are packages that add specialized functionality to Claude Code:

- **Skills** - Task-shaped knowledge that auto-loads based on the user's prompt (e.g. `miro-diagram` activates when the user asks to draw something on a board)
- **Commands** - Slash commands (`/miro-tasks:enable`) for explicit, parameterized actions
- **Agents** - Autonomous workflows for complex tasks
- **Hooks** - Event-driven automation (e.g., run code when session ends)

## Why Use Plugins vs Direct MCP?

| Feature | Direct MCP | Plugins |
|---------|------------|---------|
| Setup | Manual JSON config | One command install |
| Slash commands | None | Pre-built slash commands (where useful) |
| Guidance | Generic tool use | Skills auto-load best practices for each task |
| Automation | None | Hooks for workflows |

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
| [miro](miro.md) | Core MCP integration | Skills: `miro-browse`, `miro-diagram`, `miro-doc`, `miro-table` |
| [miro-tasks](miro-tasks.md) | Task tracking in Miro tables | Commands: `/miro-tasks:enable`, `/miro-tasks:disable`, `/miro-tasks:status` |
| [miro-solutions](miro-solutions.md) | Create customer demo plugins | Commands: `/miro-solutions:create-plugin` |

## Plugin Dependencies

Some plugins depend on others:

```
miro-tasks
└── requires: miro (for Miro MCP tools)

miro-solutions
├── requires: miro (for Miro MCP tools)
└── requires: plugin-dev (for plugin creation)
```

Install dependencies first, or install all plugins to ensure everything works.

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

- [miro plugin](miro.md) - Core commands and skills
- [miro-tasks plugin](miro-tasks.md) - Track tasks in Miro tables
- [miro-solutions plugin](miro-solutions.md) - Create demo plugins for customers
- [Plugin Development](plugin-development.md) - Build your own plugins
