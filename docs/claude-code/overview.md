# Claude Code Plugins

Claude Code plugins extend Claude's capabilities with slash commands, skills, agents, and hooks for Miro integration.

## What are Claude Code Plugins?

Plugins are packages that add specialized functionality to Claude Code:

- **Commands** - Slash commands (`/miro:diagram`) for quick actions
- **Skills** - Knowledge that teaches Claude how to use tools effectively
- **Agents** - Autonomous workflows for complex tasks
- **Hooks** - Event-driven automation (e.g., run code when session ends)

## Why Use Plugins vs Direct MCP?

| Feature | Direct MCP | Plugins |
|---------|------------|---------|
| Setup | Manual JSON config | One command install |
| Commands | None | Pre-built slash commands |
| Guidance | Generic tool use | Skills teach best practices |
| Automation | None | Hooks for workflows |

Plugins provide a higher-level experience on top of raw MCP tools.

## Installation

### From Marketplace

```bash
# Add the Miro AI marketplace
/plugin marketplace add miroapp/miro-ai

# Install plugins
/plugin install miro@miro-ai
/plugin install miro-tasks@miro-ai
/plugin install miro-solutions@miro-ai
```

Restart Claude Code after installation.

### Manual Installation

Clone the repository and add the plugin directly:

```bash
git clone https://github.com/miroapp/miro-ai.git
/plugin add ./miro-ai/claude-plugins/miro
```

## Available Plugins

| Plugin | Description | Commands |
|--------|-------------|----------|
| [miro](miro.md) | Core MCP integration | `/miro:browse`, `/miro:diagram`, `/miro:doc`, `/miro:table`, `/miro:summarize` |
| [miro-tasks](miro-tasks.md) | Task tracking in Miro tables | `/miro-tasks:enable`, `/miro-tasks:disable`, `/miro-tasks:status` |
| [miro-solutions](miro-solutions.md) | Create customer demo plugins | `/miro-solutions:create-plugin` |

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

After installing the `miro` plugin:

```
# Create a diagram on a Miro board
/miro:diagram https://miro.com/app/board/abc= user authentication flow

# Create a document
/miro:doc https://miro.com/app/board/abc= meeting notes with action items

# Browse board contents
/miro:browse https://miro.com/app/board/abc=
```

## Authentication

On first use, you'll be prompted to authenticate with Miro via OAuth. Select the team containing your target boards.

## Next Steps

- [miro plugin](miro.md) - Core commands and skills
- [miro-tasks plugin](miro-tasks.md) - Track tasks in Miro tables
- [miro-solutions plugin](miro-solutions.md) - Create demo plugins for customers
- [Plugin Development](plugin-development.md) - Build your own plugins
