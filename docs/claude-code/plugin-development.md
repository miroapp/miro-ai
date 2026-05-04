# Plugin Development Guide

This guide covers creating Claude Code plugins for Miro integration in **this repository**.

> **Scope notice.** This repo deliberately ships **skills + MCP only**. We do not accept slash commands, agents, hooks, scripts, or template files in source plugins. See [CONTRIBUTING → Scope and Conventions](../../CONTRIBUTING.md#scope-and-conventions) for the rationale and the converter contract that enforces it.
>
> Claude Code as a platform supports a much broader plugin model (commands, agents, hooks, etc.). For a guide to those features, see [Anthropic's plugin documentation](https://docs.claude.com/en/docs/claude-code). This guide intentionally covers only the surface this repo uses.

## Plugin Architecture

A Miro plugin in this repository is a directory containing:

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (required)
├── .mcp.json                # MCP server config
├── skills/                  # Knowledge skills with auto-activation
│   └── skill-name/
│       ├── SKILL.md
│       └── references/      # (optional)
└── README.md                # User-facing readme (optional)
```

Adding `commands/`, `agents/`, `hooks/`, `scripts/`, or `templates/` produces no output — the converter under `validation/src/converters/` ignores those paths.

## Plugin Manifest

The `plugin.json` manifest is required. Located at `.claude-plugin/plugin.json`:

```json
{
  "name": "miro",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": {
    "name": "Miro",
    "email": "support@miro.com"
  },
  "homepage": "https://github.com/miroapp/miro-ai",
  "repository": "https://github.com/miroapp/miro-ai",
  "license": "MIT",
  "keywords": ["miro", "mcp", "skills"]
}
```

### Required Fields
- `name` — plugin identifier (lowercase, hyphens). Must match the plugin directory name.
- `version` — semantic version. Bump on every meaningful change to source skills or MCP config.
- `description` — human-readable description. Surfaces in marketplaces.

### Optional Fields
- `author`, `homepage`, `repository`, `license`, `keywords` — propagated to all generated targets.

## Creating Skills

Skills are the only behavioral primitive this repo ships. They auto-activate from natural language using their `description` field, replacing what would otherwise be slash commands.

### Skill Structure

```
skills/
└── skill-name/
    ├── SKILL.md              # Main skill file (required)
    └── references/           # Supporting docs (optional)
        ├── tools.md
        └── examples.md
```

### Naming Convention

All skill directory names must start with `miro-` (enforced by validation). The `name` field in frontmatter must match the directory name. Both rules ensure unique, predictable activation across all targets.

### SKILL.md Format

```markdown
---
name: miro-example
description: Use when the user wants to <do X> on a Miro board (<key triggers>). Be specific so Claude can match user phrasing reliably.
---

# Skill Title

Steps the model should follow when this skill is active.

## Inputs

What to extract from the user's request (board URL, parameters, etc.).

## Workflow

1. Validate inputs (ask the user if missing).
2. Call the relevant Miro MCP tool.
3. Present results in the agreed format.

## Examples

**User input:** `<a phrase a real user would say>`

**Action:** <what the model does>
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier — must match the directory name |
| `description` | Yes | When this skill should activate. Be specific about triggers. |

The `description` is the most important field — it determines whether a user's request reaches this skill. Patterns that work well:

- Lead with `Use when the user wants to ...`
- Enumerate concrete trigger phrases / artifact types (frames, sticky notes, flowcharts, …)
- Mention the board URL or other inputs the user is likely to include

See `claude-plugins/miro/skills/miro-browse/SKILL.md` and `miro-diagram/SKILL.md` for canonical examples.

## MCP Integration

Configure MCP servers in `.mcp.json` at the plugin root:

```json
{
  "miro": {
    "type": "http",
    "url": "https://mcp.miro.com/",
    "headers": {
      "X-AI-Source": "claude-code-plugin"
    }
  }
}
```

The converter rewrites `X-AI-Source` per target (`cursor-plugin`, `gemini-extension`, `codex-plugin`). The URL must stay consistent across all targets — this is checked by `bun run validate`.

### MCP Server Types

**HTTP Server (used here):**
```json
{
  "miro": {
    "type": "http",
    "url": "https://mcp.miro.com/",
    "headers": {}
  }
}
```

**Stdio Server (supported by Claude Code, not used in this repo):**
```json
{
  "server-name": {
    "command": "npx",
    "args": ["-y", "@example/mcp-server"],
    "env": {
      "API_KEY": "${API_KEY}"
    }
  }
}
```

## Testing Plugins

### Local Development

1. Edit a skill or `.mcp.json` under `claude-plugins/miro/`.
2. Start Claude Code with the plugin loaded:
   ```bash
   claude --plugin-dir ./claude-plugins/miro
   ```
3. Trigger the skill with the kind of phrase a real user would type.
4. Run `bun run validate` and `bun run convert` to confirm no regressions.

### Validation Checklist

- [ ] `plugin.json` is valid JSON and matches Claude's plugin schema (`bun run validate`)
- [ ] Each `SKILL.md` has `name` matching the directory and a `description` with clear triggers
- [ ] `.mcp.json` URL matches downstream targets (`bun run validate`)
- [ ] No Claude-only tool names (`Write tool`, `TaskCreate`, `AskUserQuestion`, …) leak into Codex output
- [ ] `bun run convert` is idempotent — second run produces zero diff

### Testing Skill Activation

```
"list frames on https://miro.com/app/board/abc="            # → miro-browse
"create a flowchart on <board URL> showing <process>"        # → miro-diagram
"extract the specs from https://miro.com/app/board/abc="    # → miro-code-spec
```

If a skill doesn't activate, the description is the lever — make it more specific and rerun.

## Related

- [miro plugin](miro.md) — example of MCP integration with bundled skills
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — full contributor guide and scope rationale
