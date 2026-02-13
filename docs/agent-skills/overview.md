# Agent Skills

Portable knowledge skills for any AI coding tool, powered by the [agentskills.io](https://agentskills.io) specification.

## Overview

Agent Skills are lightweight, portable knowledge files that provide context and guidance to AI coding assistants. Unlike Claude Code plugins, skills are **knowledge-only** — they don't include commands, hooks, or MCP server configurations. This makes them compatible with any tool that supports the Agent Skills specification.

## Installation

```bash
npx skills add miroapp/miro-ai
```

This installs all available Miro skills into your project. The CLI will prompt you to select which skills to add.

### Options

```bash
npx skills add miroapp/miro-ai --list          # List available skills
npx skills add miroapp/miro-ai --skill=miro-mcp  # Install a specific skill
npx skills add miroapp/miro-ai --all            # Install all skills
npx skills add miroapp/miro-ai -y               # Skip confirmation prompts
```

## Available Skills

| Skill | Description |
|-------|-------------|
| miro-mcp | How to use Miro MCP tools — diagrams, documents, tables, context extraction |
| miro-platform | Miro platform overview — canvas features, content types, AI capabilities |
| miro-code-review | Code review workflows using Miro boards |

## How Skills Work

Each skill is a directory containing:

```
skill-name/
├── SKILL.md       # Metadata and description (~100 tokens)
└── references/    # Detailed knowledge files (loaded on demand)
```

- **SKILL.md** — YAML frontmatter with `description` field used for matching. The AI reads this to decide if the skill is relevant to the current task.
- **references/** — Detailed documentation loaded only when the skill is activated. This keeps token usage minimal until the knowledge is actually needed.

Skills are loaded on demand based on relevance to your prompt. The metadata in `SKILL.md` is ~100 tokens, so having many skills installed has negligible overhead.

## Compatible Tools

Agent Skills work with any tool that supports the [agentskills.io specification](https://agentskills.io):

- Claude Code
- Cursor
- VS Code + GitHub Copilot
- OpenAI Codex
- Other MCP-compatible AI coding tools

## Differences from Claude Code Plugins

| Feature | Agent Skills | Claude Code Plugins |
|---------|-------------|-------------------|
| Knowledge/context | Yes | Yes |
| Slash commands | No | Yes |
| Hooks (automation) | No | Yes |
| MCP server config | No | Yes |
| Agents | No | Yes |
| Portability | Any compatible tool | Claude Code only |

Skills are auto-generated from Claude plugin skills via `bun run convert:skills`. The source of truth is `claude-plugins/*/skills/`.

## Related

- [agentskills.io](https://agentskills.io) — Specification and compatible tools
- [Claude Code Plugins](../claude-code/overview.md) — Full-featured plugin system
- [MCP Setup Guide](../getting-started/mcp-setup.md) — General MCP configuration
- [Contributing](../../CONTRIBUTING.md#agent-skills) — Development workflow
