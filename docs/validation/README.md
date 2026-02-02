# Validation System

This repository uses automated validation to ensure code quality across all plugins, extensions, and powers.

## Quick Start

```bash
bun install      # Install dependencies + set up pre-commit hooks
bun run validate # Run all validations
```

## What's Validated

| Component | Validation | Tool |
|-----------|------------|------|
| Claude plugin.json | Schema, required fields | `claude plugin validate` CLI |
| Claude SKILL.md | YAML frontmatter + name-directory match | Ajv ([agentskills.io spec](https://agentskills.io/specification)) |
| Claude commands/*.md | YAML frontmatter schema | Ajv + gray-matter |
| Claude agents/*.md | YAML frontmatter schema | Ajv + gray-matter |
| Kiro POWER.md | YAML frontmatter schema | Ajv + gray-matter |
| Bash scripts | Syntax + permissions | ShellCheck |
| All JSON files | Syntax | JSON.parse |
| MCP configs | URL consistency | Custom checker |

## Commands

```bash
bun run validate              # All validations
bun run validate:claude       # Claude plugins only (uses CLI)
bun run validate:bash         # Bash scripts only (shellcheck)
bun run validate:frontmatter  # Markdown frontmatter only
bun run validate:consistency  # Cross-platform consistency only
```

## Pre-commit Hook

Validation runs automatically before each commit via [Husky](https://typicode.github.io/husky/).

```
.husky/pre-commit → bun run validate
```

To skip (not recommended):
```bash
git commit --no-verify -m "message"
```

## CI Integration

GitHub Actions runs validation on every push and PR to `main`:

```yaml
# .github/workflows/validate.yml
- run: bun install
- run: bun run validate
```

## Documentation

- [Schemas](./schemas.md) — JSON schema definitions for frontmatter
- [Adding Validators](./adding-validators.md) — How to extend validation
- [Troubleshooting](./troubleshooting.md) — Common errors and fixes

## Related

- [Contributing](../../CONTRIBUTING.md) — Development workflow and PR process
- [Agent Skills Spec](https://agentskills.io/specification) — SKILL.md format specification
