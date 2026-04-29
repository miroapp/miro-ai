# Cursor Plugins

Cursor plugins for Miro provide skills and MCP integration. Plugins are auto-generated from Claude Code plugin sources.

## Scope

This repository follows a deliberate **skills + MCP only** convention — see [CONTRIBUTING → Scope and Conventions](../../CONTRIBUTING.md#scope-and-conventions). The generated Cursor plugin contains:

- `.cursor-plugin/plugin.json` — plugin manifest
- `.mcp.json` — MCP server configuration (wrapped in `{ mcpServers: {...} }`)
- `skills/*/SKILL.md` (+ optional `references/`) — knowledge skills with auto-activation
- `README.md` — copied from the source Claude plugin

No commands, agents, hooks, scripts, or templates are emitted. The Cursor plugin format supports those primitives, but this repo does not use them.

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
| Skills | `miro-browse`, `miro-code-review`, `miro-code-spec`, `miro-diagram`, `miro-doc`, `miro-table` |
| MCP | Miro MCP server (`https://mcp.miro.com/`) |

## Differences from the Claude source

| Field | Claude source | Cursor output |
|-------|--------------|---------------|
| Manifest path | `.claude-plugin/plugin.json` | `.cursor-plugin/plugin.json` (synthesized, adds `displayName`) |
| MCP config shape | Flat `{ "miro": {...} }` | Wrapped `{ "mcpServers": { "miro": {...} } }` |
| MCP `X-AI-Source` header | `claude-code-plugin` | `cursor-plugin` |
| Skills | `skills/*/SKILL.md` | Identical — copied verbatim |

## Development

Plugins are auto-generated from Claude plugins. To regenerate after source changes:

```bash
bun run convert
```

This bulk command regenerates all targets (Cursor, Gemini, Codex, Skills, Copilot Cowork) from the Claude plugin source of truth.

See [CONTRIBUTING.md](../../CONTRIBUTING.md#cursor-plugins) for the full development workflow.
