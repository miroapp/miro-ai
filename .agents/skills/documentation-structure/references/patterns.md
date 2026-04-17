# Documentation Patterns Reference

## Vendor Directory Structure

Each vendor in `docs/` follows this structure:

```
docs/vendor-name/
├── overview.md           # Required: intro, installation, auth
├── component-name.md     # One per plugin/power
└── *-development.md      # Required: how to build new ones
```

Example for Claude Code:
```
docs/claude-code/
├── overview.md
├── miro.md
├── miro-tasks.md
├── miro-solutions.md
├── miro-research.md
└── plugin-development.md
```

## Related Section

Every documentation file should end with a Related section linking to related docs:

```markdown
## Related

- [Overview](overview.md) - Introduction to this integration
- [Plugin Development](plugin-development.md) - Build your own plugins
- [Tools Reference](../mcp/tools-reference.md) - MCP tool parameters
```

Rules:
- Links should be reciprocal (if A links B, B links A)
- Use relative paths
- Include brief description after dash

## Content Ownership

| Content Type | Where It Lives | NOT Here |
|--------------|----------------|----------|
| Quick start for users | README.md | docs/ |
| Full installation guide | docs/getting-started/ | README.md |
| Plugin/power architecture | docs/vendor/ | CONTRIBUTING.md |
| Local dev testing workflow | CONTRIBUTING.md | docs/ |
| API/tool reference | docs/mcp/ | anywhere else |
| Troubleshooting | docs/troubleshooting.md | scattered |

When in doubt: README is marketing, docs/ is reference, CONTRIBUTING is repo development.

## Quick Start Pattern

Always structure Quick Start as:
1. **Choose** - Platform selection
2. **Install** - Platform-specific steps in collapsibles
3. **Configure** - Authentication/setup
4. **Try It** - Example commands

## Collapsible Sections

Use for platform-specific content to reduce visual clutter:

```html
<details open>
<summary><strong>Primary Option</strong> (Recommended)</summary>

Content here...

</details>

<details>
<summary><strong>Alternative Option</strong></summary>

Content here...

</details>
```

- First/recommended option uses `open` attribute
- Others collapsed by default
- Use `<strong>` for option names

## Tables

Use tables for:
- Comparing options/features
- Listing commands with descriptions
- Showing component → purpose mappings

```markdown
| Component | What It Does |
|-----------|--------------|
| **Name** | Description |
```

- Bold the component name
- Keep descriptions concise

## Validation Checklists

Use for pre-commit/pre-PR checks:

```markdown
### Validation Checklist

- [ ] `plugin.json` is valid JSON
- [ ] All commands have `description` in frontmatter
- [ ] Skills have `SKILL.md` with required fields
```

## Callout Boxes

Use blockquotes for important notices:

```markdown
> **Title**: Brief explanation of the notice.
>
> Additional details or links.
```

## Code Blocks

- Always specify language for syntax highlighting
- Use copy-friendly single commands
- Avoid `$` prefix unless showing output

```bash
# Good - easy to copy
claude --plugin-dir ./claude-plugins/miro

# Avoid - harder to copy
$ claude --plugin-dir ./claude-plugins/miro
```

## Directory Trees

Show structure with consistent formatting:

```
project-name/
├── folder/
│   ├── subfolder/
│   │   └── file.md
│   └── file.json
└── root-file.md
```

## Debugging Sections

Use problem → solution format:

```markdown
### Debugging Tips

**Plugin not loading?**
- Check `plugin.json` syntax
- Verify correct path with `--plugin-dir`

**Command not working?**
- Verify frontmatter YAML is valid
```

## Link Organization

Group documentation links by category:

```markdown
### Getting Started
- [Guide 1](path) - Description
- [Guide 2](path) - Description

### Reference
- [Ref 1](path)
- [Ref 2](path)
```

## Maintenance Checklist

When updating documentation:

- [ ] All links resolve correctly
- [ ] Code examples are copy-pasteable
- [ ] Tables have consistent formatting
- [ ] Collapsibles have matching open/close tags
- [ ] Validation checklists use `- [ ]` format
