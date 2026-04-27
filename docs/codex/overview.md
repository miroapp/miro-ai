# Codex Plugins

Codex plugins in this repository are generated from the Claude plugin source of truth and exposed through a repo-local marketplace.

## What Are Codex Plugins?

Codex plugins package higher-level workflows on top of raw MCP access:

- `.codex-plugin/plugin.json` - plugin manifest and UI metadata
- `skills/*/SKILL.md` - reusable workflow guidance
- `.mcp.json` - MCP config (`miro` only)

## Why Use Codex Plugins vs Direct MCP?

| Feature | Direct MCP | Codex Plugins |
|---------|------------|---------------|
| Setup | Manual config | Repo-local marketplace |
| Commands | None | Not converted |
| Guidance | Generic tool use | Skills teach best practices |
| Miro workflows | Manual tool choice | `miro-mcp` skill + MCP |

## Available Plugins

| Plugin | Description | Surface |
|--------|-------------|----------|
| `miro` | Core MCP integration | `$miro:miro-mcp` plus Miro MCP tools |

Codex plugins do not define a `commands` manifest component. This repository does not convert Claude commands for Codex. In Codex CLI, slash commands are built-ins; use `$miro:miro-mcp` and the Miro MCP tools directly.

## Availability

This generated Codex output lives in `codex-plugins/miro/` with the repo marketplace at `.agents/plugins/marketplace.json`.

For regeneration, validation, and local testing, see [Contributing](../../CONTRIBUTING.md#codex-plugins).

## Related

- [Documentation Hub](../README.md) - Platform docs index
- [Contributing](../../CONTRIBUTING.md#codex-plugins) - Regeneration and local testing
- [Gemini CLI Overview](../gemini-cli/overview.md) - Broader generated subset on Gemini
