# Validation Troubleshooting

Common errors and how to fix them.

## Frontmatter Errors

### "can not read an implicit mapping pair; a colon is missed"

**Cause:** YAML is interpreting brackets `[]` as array syntax.

**Bad:**
```yaml
argument-hint: [board-url] [query?]
```

**Good:**
```yaml
argument-hint: "[board-url] [query?]"
```

**Fix:** Quote values containing brackets.

---

### "No YAML frontmatter found"

**Cause:** File doesn't start with `---` or frontmatter is malformed.

**Required format:**
```markdown
---
description: Your description here
---

# Content starts here
```

---

### "/description: must be string"

**Cause:** Description field is missing or wrong type.

**Fix:** Add a `description` field with a string value:
```yaml
---
description: "Brief description of this component"
---
```

---

### "must NOT have fewer than X characters"

**Cause:** Field value is too short.

**Minimum lengths:**
- SKILL.md `name`: 1 character
- SKILL.md `description`: 1 character (max 1024)
- Command `description`: 5 characters
- Agent `description`: 10 characters
- POWER.md `description`: 10 characters
- POWER.md `displayName`: 3 characters

---

### "name must match directory name"

**Cause:** SKILL.md `name` field doesn't match its parent directory name ([agentskills.io spec](https://agentskills.io/specification)).

**Bad:**
```
skills/my-skill/SKILL.md
---
name: different-name  # ✗ doesn't match "my-skill"
---
```

**Good:**
```
skills/my-skill/SKILL.md
---
name: my-skill  # ✓ matches directory
---
```

**Fix:** Ensure `name` exactly matches the directory containing the SKILL.md file.

---

### "name must match pattern"

**Cause:** SKILL.md `name` doesn't follow the required format.

**Rules ([agentskills.io spec](https://agentskills.io/specification)):**
- Lowercase letters, numbers, and hyphens only
- Must start with a letter
- Cannot start or end with hyphen
- No consecutive hyphens (`--`)
- Max 64 characters

**Bad:**
```yaml
name: My-Skill      # uppercase
name: -my-skill     # starts with hyphen
name: my--skill     # consecutive hyphens
```

**Good:**
```yaml
name: my-skill
name: miro-mcp
name: data-analysis-2
```

---

## Bash Script Errors

### "File is not executable"

**Fix:**
```bash
chmod +x scripts/your-script.sh
```

---

### ShellCheck warnings

ShellCheck warnings don't fail validation but should be fixed.

**Common issues:**

| Code | Issue | Fix |
|------|-------|-----|
| SC2046 | Unquoted command substitution | Use `"$(cmd)"` |
| SC2086 | Unquoted variable | Use `"$var"` |
| SC2006 | Legacy backticks | Use `$(cmd)` instead |

**Example fix:**
```bash
# Bad (SC2086)
echo $var

# Good
echo "$var"
```

---

### "shellcheck not found"

**Install ShellCheck:**

```bash
# macOS
brew install shellcheck

# Ubuntu/Debian
sudo apt-get install shellcheck

# Other
https://www.shellcheck.net/
```

Validation continues without ShellCheck but won't lint bash scripts.

---

## JSON Errors

### "Unexpected token"

**Cause:** Invalid JSON syntax (trailing comma, missing quote, etc.)

**Debug:**
```bash
cat file.json | jq .
```

**Common issues:**
- Trailing comma after last item
- Missing quotes around keys
- Single quotes instead of double quotes

---

## Consistency Errors

### "MCP URL inconsistency"

**Cause:** Different MCP URLs across platforms.

**Check these files:**
- `claude-plugins/*/.mcp.json`
- `powers/*/mcp.json`
- `gemini-extension.json`

All should use the same base URL: `https://mcp.miro.com/`

---

### "X-AI-Source headers inconsistent"

**Cause:** Same platform has different source headers.

**Expected:**
- Claude plugins: `claude-code-plugin`
- Kiro powers: `kiro-code-gen-extension`
- Gemini extension: `gemini-extension`

---

## Claude CLI Errors

### "claude: command not found"

**Install Claude Code CLI:**
```bash
npm install -g @anthropic-ai/claude-code
```

Validation continues without CLI but won't validate plugin.json files.

---

### "Plugin has an invalid manifest"

**Debug:**
```bash
claude plugin validate ./claude-plugins/your-plugin
```

Check `.claude-plugin/plugin.json` for:
- Valid JSON syntax
- Required `name` field
- Valid paths in `commands` array

---

## Pre-commit Hook Issues

### Hook not running

**Verify hook exists:**
```bash
cat .husky/pre-commit
```

**Reinstall hooks:**
```bash
bun install
```

---

### Bypass hook (emergency only)

```bash
git commit --no-verify -m "message"
```

> **Warning:** Only use when absolutely necessary. Fix validation errors instead.

---

## Getting Help

1. Run with verbose output: `bun run validate 2>&1 | less`
2. Check specific validator: `bun run validate:frontmatter`
3. Open an issue: [github.com/miroapp/miro-ai/issues](https://github.com/miroapp/miro-ai/issues)

## Related

- [Validation Overview](./README.md) — What's validated and how
- [Schemas](./schemas.md) — JSON schema definitions
- [Agent Skills Spec](https://agentskills.io/specification) — SKILL.md format specification
