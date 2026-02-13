# Contributing to Miro AI

Thank you for your interest in contributing to Miro AI. This guide covers development workflows for each platform.

## Quick Links

- [Local Development Setup](#local-development-setup)
- [Claude Code Plugins](#claude-code-plugins)
- [Kiro Powers](#kiro-powers)
- [Gemini CLI Extensions](#gemini-cli-extensions)
- [General Guidelines](#general-guidelines)

---

## Local Development Setup

### Prerequisites

- Git
- [Bun](https://bun.sh/) — required for validation
- [ShellCheck](https://www.shellcheck.net/) — optional, for bash script linting
- Your AI tool of choice (Claude Code, Kiro, or Gemini CLI)

### Clone and Setup

```bash
git clone https://github.com/miroapp/miro-ai.git
cd miro-ai
bun install
```

This installs dependencies and sets up **pre-commit hooks** automatically via Husky.

### Validation

Run validation before committing (also runs automatically on pre-commit):

```bash
bun run validate
```

| What's Validated | How |
|------------------|-----|
| Claude plugin.json files | `claude plugin validate` CLI |
| SKILL.md frontmatter | JSON schema (requires `description`) |
| Command .md frontmatter | JSON schema (requires `description`) |
| Agent .md frontmatter | JSON schema (requires `description`, `tools`) |
| Kiro POWER.md frontmatter | JSON schema (requires `name`, `displayName`, `description`, `keywords`) |
| Bash scripts | ShellCheck + executable permission check |
| All JSON files | Syntax validation |
| MCP configurations | URL consistency across platforms |

**Individual validators:**

```bash
bun run validate:claude       # Claude plugins only
bun run validate:bash         # Bash scripts only
bun run validate:frontmatter  # Markdown frontmatter only
bun run validate:consistency  # Cross-platform consistency only
```

See [Validation Documentation](docs/validation/README.md) for detailed information on schemas, troubleshooting, and extending validators.

### Repository Structure

```
miro-ai/
├── claude-plugins/           # Claude Code plugins (source of truth)
│   ├── miro/                # Core MCP integration
│   ├── miro-tasks/          # Task tracking
│   ├── miro-solutions/      # Demo plugin generator
│   ├── miro-research/       # Research visualization
│   └── miro-review/         # Code review workflows
├── gemini-extensions/        # Gemini CLI extensions (auto-generated)
│   ├── miro/
│   ├── miro-tasks/
│   ├── miro-research/
│   └── miro-review/
├── skills/                   # Agent Skills (auto-generated from claude-plugins)
├── powers/                   # Kiro powers
│   └── code-gen/            # Design-to-code
├── validation/               # Validators and converters
│   └── src/
│       └── converters/      # bun run convert
├── docs/                     # Documentation
│   ├── claude-code/         # Plugin docs
│   ├── kiro/                # Power docs
│   ├── gemini-cli/          # Extension docs
│   └── mcp/                 # MCP reference
└── README.md
```

---

## Claude Code Plugins

### Development Workflow

**Option 1: Using `--plugin-dir` (Recommended for development)**

Start Claude Code with your plugin directory loaded directly:

```bash
# Single plugin
claude --plugin-dir ./claude-plugins/miro

# Multiple plugins
claude --plugin-dir ./claude-plugins/miro --plugin-dir ./claude-plugins/miro-tasks
```

This approach:
- Loads the plugin from your local directory
- Picks up changes when you restart Claude Code
- Doesn't require installing/uninstalling the plugin

**Option 2: Local installation with `/plugin add`**

```bash
# Install from local directory
/plugin add ./claude-plugins/miro

# Uninstall when done testing
/plugin uninstall miro
```

### Testing Plugins Locally

1. **Start Claude Code with your plugin:**
   ```bash
   claude --plugin-dir ./claude-plugins/miro
   ```

2. **Verify the plugin loaded:**
   ```
   /plugin list
   ```
   You should see your plugin in the list.

3. **Test commands:**
   ```
   /miro:diagram https://miro.com/app/board/test= "user login flow"
   ```

4. **Test skill activation:**
   Ask a question that should trigger the skill:
   ```
   "How do I create a diagram on Miro?"
   ```

5. **Test hooks (if applicable):**
   - Trigger the hook event (e.g., end a session for `Stop` hooks)
   - Check that the hook script runs and returns expected output

### Testing the Marketplace Locally

If you're modifying `.claude-plugin/marketplace.json`:

1. **Add local marketplace:**
   ```bash
   /plugin marketplace add /path/to/miro-ai
   ```

2. **Install plugins from it:**
   ```bash
   /plugin install miro@miro-ai
   /plugin install miro-tasks@miro-ai
   /plugin install miro-solutions@miro-ai
   /plugin install miro-research@miro-ai
   ```

3. **Verify all plugins appear:**
   ```bash
   /plugin marketplace list
   ```

4. **Validate JSON:**
   ```bash
   claude plugin validate .
   ```

### Making Changes

1. Edit files in `claude-plugins/your-plugin/`
2. Restart Claude Code to pick up changes
3. Test the affected functionality
4. Repeat until working

### Plugin Structure Reference

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (required)
├── .mcp.json                # MCP server config (optional)
├── hooks/                   # Hook definitions (optional)
│   └── hooks.json
├── commands/                # Slash commands
│   └── command-name.md
├── skills/                  # Knowledge skills
│   └── skill-name/
│       ├── SKILL.md
│       └── references/
├── agents/                  # Autonomous agents
│   └── agent-name.md
├── scripts/                 # Shell scripts for hooks
└── templates/               # Template files
```

### Validation Checklist

Before submitting a PR, run `bun run validate` to automatically check:

- [x] `plugin.json` is valid JSON
- [x] All commands have `description` in frontmatter
- [x] Skills have `SKILL.md` with `description` in frontmatter
- [x] Scripts are executable (`chmod +x scripts/*.sh`)
- [x] Bash scripts pass ShellCheck (if installed)

**Manual verification still needed:**

- [ ] Hooks return valid JSON if `parseJson: true`
- [ ] MCP servers are reachable
- [ ] Commands work end-to-end

### Debugging Tips

**Plugin not loading?**
- Check `plugin.json` syntax with `cat plugin.json | jq .`
- Ensure you're using the correct path with `--plugin-dir`

**Command not working?**
- Verify frontmatter YAML is valid
- Check that required fields (`description`) are present

**Skill not activating?**
- Make sure `SKILL.md` exists at the skill root
- Check that the `description` field contains trigger keywords

**Hook not running?**
- Verify scripts are executable: `chmod +x scripts/*.sh`
- Test script manually: `./scripts/hook.sh`
- Check JSON output is valid if using `parseJson: true`

---

## Kiro Powers

### Development Workflow

1. **Create or edit power directory:**
   ```bash
   # Powers live in the powers/ directory
   cd powers/code-gen
   ```

2. **Power files:**
   - `POWER.md` — Steering instructions for the AI (required)
   - `mcp.json` — MCP server configuration (optional, only needed for MCP tools)

3. **Test with Kiro using Local Path:**
   - In Kiro, open the **Powers** panel
   - Click **Add power from Local Path**
   - Select your power directory (e.g., `miro-ai/powers/code-gen/`)
   - Test with sample prompts

### Power Structure Reference

```
power-name/
├── POWER.md     # Steering instructions (required)
└── mcp.json     # MCP configuration (optional)
```

### POWER.md Format

```markdown
---
name: "power-name"
displayName: "Human Readable Name"
description: "What this power does"
keywords: ["keyword1", "keyword2", "keyword3"]
---

# Power Name

Steering instructions for the AI.

## Onboarding

Setup and authentication steps.

## Workflow

Steps the AI should follow.
```

**Required frontmatter fields:** `name`, `displayName`, `description`, `keywords`

### Validation Checklist

Run `bun run validate` to automatically check:

- [x] `POWER.md` has valid YAML frontmatter (`name`, `displayName`, `description`, `keywords`)
- [x] `mcp.json` is valid JSON

**Manual verification still needed:**

- [ ] MCP server is reachable
- [ ] Steering instructions are clear and actionable

---

## Gemini CLI Extensions

Extensions are auto-generated from Claude plugins via `bun run convert`. They live in `gemini-extensions/*/`, each containing a `gemini-extension.json` plus converted commands (TOML), skills, hooks, and agents.

### Development Workflow

1. **Edit the source Claude plugin:**
   ```bash
   vim claude-plugins/miro/commands/diagram.md
   ```

2. **Regenerate extensions:**
   ```bash
   bun run convert --gemini                    # All extensions
   bun run convert --gemini --plugin=miro      # Single extension
   bun run convert --gemini --dry-run          # Preview changes
   ```

3. **Link an extension for local testing:**
   ```bash
   gemini extensions link ./gemini-extensions/miro
   gemini extensions link ./gemini-extensions/miro-tasks
   ```

4. **Restart Gemini CLI**

5. **Test:**
   - Verify TOML commands load
   - Verify MCP tools are accessible
   - Test agent workflows (if applicable)

### Extension Structure

Each generated extension in `gemini-extensions/*/`:

```
extension-name/
├── gemini-extension.json    # Extension manifest with MCP config
├── commands/                # TOML commands (converted from .md)
├── skills/                  # Knowledge skills (if any)
├── hooks/                   # Hook definitions (if any)
├── agents/                  # Agent definitions (if any)
└── scripts/                 # Shell scripts (if any)
```

### Validation Checklist

Run `bun run validate` to automatically check:

- [x] JSON is valid
- [x] MCP server URL is consistent with other platforms

**Manual verification still needed:**

- [ ] Extension loads in Gemini CLI
- [ ] TOML commands are accessible
- [ ] MCP tools work end-to-end

---

## Agent Skills

See [Agent Skills Overview](docs/agent-skills/overview.md) for user-facing documentation.

Skills are auto-generated from Claude plugin skills via `bun run convert:skills`. They live in `skills/*/` following the [agentskills.io specification](https://agentskills.io/specification).

### Development Workflow

1. **Edit the source Claude plugin skill:**
   ```bash
   vim claude-plugins/miro/skills/miro-mcp/SKILL.md
   ```

2. **Regenerate skills:**
   ```bash
   bun run convert:skills                       # All skills
   bun run convert:skills --plugin=miro         # Single plugin's skills
   bun run convert:skills --dry-run             # Preview changes
   ```

3. **Test locally:**
   ```bash
   npx skills add ./
   ```

### Naming Convention

All skill directory names under `claude-plugins/` must start with `miro-` (enforced by validation). This ensures unique names when published as Agent Skills.

---

## General Guidelines

### Code Style

- Use clear, descriptive names
- Add comments for complex logic
- Follow existing patterns in the codebase

### Documentation

- Update docs when changing functionality
- Include practical examples
- Verify all links resolve correctly

### Reporting Bugs

1. Search [existing issues](https://github.com/miroapp/miro-ai/issues) to avoid duplicates
2. Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, AI tool, versions)

### Requesting Features

1. Open an issue describing the feature
2. Explain the use case and benefits
3. Include examples if possible

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test thoroughly using the workflows above
5. Submit a pull request with:
   - Clear description of changes
   - Reference to related issues
   - Test steps you performed
   - Screenshots if UI-related

---

## Questions?

- Open a [discussion](https://github.com/miroapp/miro-ai/discussions)
- Join the [Miro Developer Community](https://community.miro.com/)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
