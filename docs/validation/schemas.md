# Validation Schemas

JSON schemas used to validate YAML frontmatter in markdown files.

## Schema Files

Located in `validation/schemas/`:

| Schema | Validates | Source |
|--------|-----------|--------|
| `skill-frontmatter.schema.json` | `**/skills/*/SKILL.md` | [Claude Code docs](https://code.claude.com/docs/en/skills) |
| `command-frontmatter.schema.json` | `**/commands/*.md` | [Claude Code docs](https://code.claude.com/docs/en/plugins-reference) |
| `agent-frontmatter.schema.json` | `**/agents/*.md` | [Claude Code docs](https://code.claude.com/docs/en/sub-agents) |
| `power-frontmatter.schema.json` | `**/POWER.md` | [Kiro docs](https://kiro.dev/docs/powers/create/) |

---

## Claude Code SKILL.md

**File:** `validation/schemas/skill-frontmatter.schema.json`

**Required fields:**
- `description` (string, min 10 chars) — When to use this skill

**Optional fields:**
- `name` (string) — Skill identifier
- `disable-model-invocation` (boolean) — Prevent automatic invocation

**Example:**
```yaml
---
description: Create diagrams on Miro boards from text descriptions
---
```

---

## Claude Code Commands

**File:** `validation/schemas/command-frontmatter.schema.json`

**Required fields:**
- `description` (string, min 5 chars) — Shown in `/help` output

**Optional fields:**
- `argument-hint` (string) — Syntax hint, e.g. `"[board-url] [query?]"`
- `allowed-tools` (string) — Comma-separated tool list

**Example:**
```yaml
---
description: Create a diagram on a Miro board
argument-hint: "[board-url] [description]"
allowed-tools: Bash(sh:*), AskUserQuestion
---
```

> **Note:** Values with brackets must be quoted to avoid YAML parsing errors.

---

## Claude Code Agents

**File:** `validation/schemas/agent-frontmatter.schema.json`

**Required fields:**
- `description` (string, min 10 chars) — When to use this agent

**Optional fields:**
- `name` (string) — Agent identifier
- `capabilities` (array of strings) — Task list
- `tools` (string) — Comma-separated tool list
- `model` (string) — `sonnet`, `opus`, or `haiku`

**Example:**
```yaml
---
description: Creates custom Miro plugins during sales demos
capabilities: ["research MCP availability", "generate plugin code"]
tools: Read, Write, Grep, Glob, Bash, WebSearch
model: sonnet
---
```

---

## Kiro POWER.md

**File:** `validation/schemas/power-frontmatter.schema.json`

**Required fields:**
- `name` (string, kebab-case) — Internal identifier
- `displayName` (string, min 3 chars) — UI title
- `description` (string, min 10 chars) — Power summary
- `keywords` (array of strings, min 1) — Activation triggers

**Optional fields:**
- `author` (string) — Creator attribution

**Example:**
```yaml
---
name: "miro-codegen"
displayName: "Miro Board Context for Codegen"
description: "Uses Miro boards as the source of truth for architectural specs"
keywords: ["miro", "diagram", "workflow", "whiteboard"]
---
```

---

## Vendor Documentation References

- **Claude Code Plugins**: [code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference)
- **Claude Code Skills**: [code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)
- **Claude Code Agents**: [code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)
- **Kiro Powers**: [kiro.dev/docs/powers/create](https://kiro.dev/docs/powers/create/)
- **Gemini CLI Extensions**: [google-gemini.github.io/gemini-cli/docs/extensions](https://google-gemini.github.io/gemini-cli/docs/extensions/)
- **Gemini Settings Schema**: [raw.githubusercontent.com/.../settings.schema.json](https://raw.githubusercontent.com/google-gemini/gemini-cli/main/schemas/settings.schema.json)
