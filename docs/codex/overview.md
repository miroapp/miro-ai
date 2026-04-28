# Codex Plugins

Codex plugins in this repository are generated from the Claude plugin source of truth and exposed through a repo-local marketplace.

## Scope

This repository follows a deliberate **skills + MCP only** convention — see [CONTRIBUTING → Scope and Conventions](../../CONTRIBUTING.md#scope-and-conventions). The generated Codex plugin contains:

- `.codex-plugin/plugin.json` — plugin manifest and UI metadata
- `.mcp.json` — MCP server configuration
- `skills/*/SKILL.md` plus a generated `agents/openai.yaml` per skill — Codex requires this companion file for skill activation
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

## Codex-specific adaptations

Codex's mental model differs from Claude Code, so the generated SKILL.md bodies have a small set of text rewrites applied during `bun run convert` (Codex target):

- Claude tool names (`Write tool`, `TaskCreate`, `AskUserQuestion`, `Read tool`, `Task tool`) are replaced with platform-neutral phrasing (`file-writing step`, `internal checklist`, `asking the user directly`, etc.).
- "Claude Code" branding is replaced with "Codex" where it appears in user-facing text.

The skill structure, frontmatter shape, and content semantics are otherwise identical to the source.

## Availability

The generated Codex output lives in `codex-plugins/miro/` with the repo marketplace at `.agents/plugins/marketplace.json`.

For regeneration, validation, and local testing, see [Contributing](../../CONTRIBUTING.md#codex-plugins).

## Related

- [Documentation Hub](../README.md) - Platform docs index
- [Contributing](../../CONTRIBUTING.md#codex-plugins) - Regeneration and local testing
- [Gemini CLI Overview](../gemini-cli/overview.md) - Sibling generated target
