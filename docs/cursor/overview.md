# Cursor Plugins

Cursor plugins provide commands, skills, hooks, and MCP integration for Miro — nearly identical to Claude Code's plugin system. Plugins are auto-generated from Claude Code plugin sources.

## What Are Cursor Plugins?

Cursor plugins use the same structure as Claude Code plugins:

- `.cursor-plugin/plugin.json` — plugin manifest
- `commands/*.md` — slash commands with YAML frontmatter
- `skills/*/SKILL.md` — knowledge skills with references
- `agents/*.md` — autonomous agent definitions
- `hooks/hooks.json` — event-driven automation
- `.mcp.json` — MCP server configuration
- `scripts/` — shell scripts for hooks and commands

## Installation

### Marketplace (recommended)

Install via the Cursor IDE ([docs](https://cursor.com/docs/plugins)):

1. Run `/add-plugin` in Cursor and search for **"Miro"**
2. Or browse [cursor.com/marketplace](https://cursor.com/marketplace) and click Install

### Local development

> **Note:** Local plugin loading is not officially documented — this is a [community workaround](https://forum.cursor.com/t/cursor-2-5-plugins/152124).

```bash
git clone https://github.com/miroapp/miro-ai.git
cp -r miro-ai/cursor-plugins/miro ~/.cursor/plugins/miro
# Restart Cursor
```

On first use, you'll be prompted to authenticate with Miro via OAuth.

## Available Plugins

### miro (core)

| Component | Files |
|-----------|-------|
| Commands | `browse.md`, `diagram.md`, `doc.md`, `summarize.md`, `table.md` |
| Skills | `miro-mcp` — MCP tools reference |
| MCP | Miro MCP server (`https://mcp.miro.com/`) |

### miro-tasks

| Component | Files |
|-----------|-------|
| Commands | `enable.md`, `disable.md`, `status.md` |
| Hooks | `stop` — auto-sync tasks on session end |
| Scripts | Task tracking shell scripts |

### miro-research

| Component | Files |
|-----------|-------|
| Commands | `research.md` |
| MCP | Glean MCP (optional) |

### miro-review

| Component | Files |
|-----------|-------|
| Commands | `review.md` |
| Skills | `miro-code-review` — review patterns and risk assessment |

### miro-spec

| Component | Files |
|-----------|-------|
| Commands | `get.md` |
| Skills | `miro-spec-guide` — design spec extraction |

## Differences from Claude Code Plugins

| Feature | Claude Code | Cursor |
|---------|------------|--------|
| Commands | `description`, `argument-hint`, `allowed-tools` | `name`, `description` |
| Skills | Identical | Identical |
| Agents | `name`, `description`, `tools`, `model` | `name`, `description` only |
| Hook events | PascalCase (`Stop`, `PreToolUse`) | camelCase (`stop`, `preToolUse`) |
| Hook structure | `[{hooks: [{type, command, parseJson}]}]` | `[{command}]` (flat, no type) |
| Scripts | `${CLAUDE_PLUGIN_ROOT}` | `.` (relative paths) |
| Templates | Supported | Not supported |
| MCP config | Flat `{ "miro": {...} }` | Wrapped `{ "mcpServers": { "miro": {...} } }` |

## Limitations

Only **miro-solutions** is excluded from conversion (sales-only plugin with template dependencies).

## Development

Plugins are auto-generated from Claude plugins. To regenerate after source changes:

```bash
bun run convert:cursor
```

See [CONTRIBUTING.md](../../CONTRIBUTING.md#cursor-plugins) for the full development workflow.
