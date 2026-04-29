# Codex Plugins

Codex plugins in this repository are generated from the Claude plugin source of truth and exposed through a repo-local marketplace.

## Scope

This repository follows a deliberate **skills + MCP only** convention — see [CONTRIBUTING → Scope and Conventions](../../CONTRIBUTING.md#scope-and-conventions). The generated Codex plugin contains:

- `.codex-plugin/plugin.json` — plugin manifest and UI metadata
- `.mcp.json` — MCP server configuration
- `skills/*/SKILL.md` — copied verbatim from the source. Per [Codex Skills docs](https://developers.openai.com/codex/skills), `SKILL.md` frontmatter alone is sufficient for activation; the optional `agents/openai.yaml` companion is intentionally not emitted because we don't customize Codex-specific UI metadata, invocation policy, or tool dependencies beyond what's already in the SKILL.md frontmatter.
- `README.md` — generated platform-specific readme

No commands, agents (subagents), or hooks are emitted. Codex's plugin format does not support a `commands` manifest component anyway; slash commands in Codex CLI are built-ins. Use skill triggers and the Miro MCP tools directly.

## Why Use Codex Plugins vs Direct MCP?

| Feature | Direct MCP | Codex Plugins |
|---------|------------|---------------|
| Setup | Manual config | Repo-local marketplace |
| Guidance | Generic tool use | Skills teach Miro-specific best practices |
| Workflow patterns | Manual tool choice | Auto-activating skills (e.g. `$miro:miro-diagram`) |

## Available Plugins

| Plugin | Description | Surface |
|--------|-------------|---------|
| `miro` | Core MCP integration | Skills `miro-browse`, `miro-code-review`, `miro-code-spec`, `miro-diagram`, `miro-doc`, `miro-table` plus the Miro MCP tools |

## Skill content

Skills are copied verbatim from the Claude source — byte-identical to Cursor, Gemini, and the agent-skills mirror. Source skills are authored in platform-neutral phrasing (`file-writing step`, `internal checklist`, `ask the user directly`), so no per-target text adaptation is needed and no Codex-specific sidecar files are written. Codex activates each skill from its `SKILL.md` frontmatter directly.

## Availability

The generated Codex output lives in `codex-plugins/miro/` with the repo marketplace at `.agents/plugins/marketplace.json`.

For regeneration, validation, and local testing, see [Contributing](../../CONTRIBUTING.md#codex-plugins).

## Related

- [Documentation Hub](../README.md) - Platform docs index
- [Contributing](../../CONTRIBUTING.md#codex-plugins) - Regeneration and local testing
- [Gemini CLI Overview](../gemini-cli/overview.md) - Sibling generated target
