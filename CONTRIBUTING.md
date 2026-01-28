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
- Your AI tool of choice installed (Claude Code, Kiro, or Gemini CLI)
- Node.js (optional, for some MCP tools)

### Clone the Repository

```bash
git clone https://github.com/miroapp/miro-ai.git
cd miro-ai
```

### Repository Structure

```
miro-ai/
├── claude-plugins/          # Claude Code plugins
│   ├── miro/               # Core MCP integration
│   ├── miro-tasks/         # Task tracking
│   └── miro-solutions/     # Demo plugin generator
├── powers/                  # Kiro powers
│   └── code-gen/           # Design-to-code
├── docs/                    # Documentation
│   ├── claude-code/        # Plugin docs
│   ├── kiro/               # Power docs
│   ├── gemini-cli/         # Extension docs
│   └── mcp/                # MCP reference
├── gemini-extension.json    # Gemini CLI extension
└── README.md               # Main documentation
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

Before submitting a PR, verify:

- [ ] `plugin.json` is valid JSON
- [ ] All commands have `description` in frontmatter
- [ ] Skills have `SKILL.md` with `name` and `description` in frontmatter
- [ ] Hooks return valid JSON if `parseJson: true`
- [ ] Scripts are executable (`chmod +x scripts/*.sh`)
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

3. **Test with Kiro:**
   - Configure Kiro to use your power directory
   - Restart Kiro
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
name: power-name
description: What this power does
---

# Power Name

Steering instructions for the AI.

## When to Use

Describe when this power should activate.

## Workflow

Steps the AI should follow.
```

### Validation Checklist

- [ ] `POWER.md` has valid YAML frontmatter
- [ ] `mcp.json` is valid JSON
- [ ] MCP server is reachable
- [ ] Steering instructions are clear and actionable

---

## Gemini CLI Extensions

### Development Workflow

1. **Edit the extension file:**
   ```bash
   vim gemini-extension.json
   ```

2. **Validate JSON:**
   ```bash
   cat gemini-extension.json | jq .
   ```

3. **Copy to Gemini config:**
   ```bash
   mkdir -p ~/.gemini/extensions/miro
   cp gemini-extension.json ~/.gemini/extensions/miro/gemini-extension.json
   ```

4. **Restart Gemini CLI**

5. **Test MCP tools are available**

### Extension Format

```json
{
  "name": "Miro",
  "version": "1.0.0",
  "mcpServers": {
    "miro": {
      "httpUrl": "https://mcp.miro.com/"
    }
  }
}
```

### Validation Checklist

- [ ] JSON is valid
- [ ] MCP server URL is correct
- [ ] Extension loads in Gemini CLI
- [ ] MCP tools are accessible

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
