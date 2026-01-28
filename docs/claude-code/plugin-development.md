# Plugin Development Guide

This guide covers creating Claude Code plugins for Miro integration.

## Plugin Architecture

A Claude Code plugin is a directory containing:

```
plugin-name/
├── .claude-plugin/
│   ├── plugin.json          # Plugin manifest (required)
│   └── hooks.json           # Hook definitions (optional)
├── .mcp.json                # MCP server config (optional)
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

## Plugin Manifest

The `plugin.json` manifest is required. Located at `.claude-plugin/plugin.json`:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": {
    "name": "Your Name",
    "email": "you@example.com"
  },
  "homepage": "https://github.com/yourname/plugin",
  "repository": "https://github.com/yourname/plugin",
  "license": "MIT",
  "keywords": ["miro", "integration"]
}
```

### Required Fields
- `name` - Plugin identifier (lowercase, hyphens)
- `version` - Semantic version
- `description` - Human-readable description

### Optional Fields
- `author` - Author information
- `homepage` - Project homepage
- `repository` - Source repository
- `license` - License identifier
- `keywords` - Search/categorization tags
- `hooks` - Path to hooks.json (e.g., `./.claude-plugin/hooks.json`)
- `commands` - Explicit command paths (auto-discovered if omitted)

## Creating Commands

Commands provide slash commands (`/plugin:command`) for users.

### Command File Structure

Create `.md` files in the `commands/` directory:

```markdown
---
description: Short description for /help
argument-hint: [required-arg] [optional-arg?]
allowed-tools: Bash(sh:*), AskUserQuestion
---

# Command Title

Instructions for Claude when executing this command.

## Arguments

How to parse user input from $ARGUMENTS.

## Workflow

Steps Claude should follow.

## Examples

Usage examples.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `description` | Yes | Shown in `/help` output |
| `argument-hint` | No | Syntax hint for arguments |
| `allowed-tools` | No | Tools the command can use |

### Example Command

`commands/diagram.md`:

```markdown
---
description: Create a diagram on a Miro board
argument-hint: [board-url] [description]
---

# Create Diagram

Create a diagram on the specified Miro board.

## Arguments

Parse user input to extract:
1. **board-url** (required): Miro board URL
2. **description** (required): What to diagram

## Workflow

1. If board URL is missing, ask the user
2. If description is unclear, ask for clarification
3. Call `mcp__miro__draft_diagram_new` with the parameters
4. Report success with a link to the board
```

## Creating Skills

Skills provide knowledge that teaches Claude how to use tools effectively.

### Skill Structure

```
skills/
└── skill-name/
    ├── SKILL.md              # Main skill file (required)
    └── references/           # Supporting docs (optional)
        ├── tools.md
        └── examples.md
```

### SKILL.md Format

```markdown
---
name: skill-name
description: When this skill should be used. Be specific about triggers.
---

# Skill Title

Knowledge content for Claude.

## Key Concepts

Important information about the topic.

## Best Practices

How to use this effectively.

## References

- [Tools Reference](references/tools-reference.md)
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier |
| `description` | Yes | When to activate this skill |

The description is critical - it determines when Claude loads the skill. Be specific about trigger conditions.

## Creating Agents

Agents are autonomous workflows for complex multi-step tasks.

### Agent File Structure

Create `.md` files in the `agents/` directory:

```markdown
---
name: agent-name
description: When to invoke this agent. Be specific.
tools: Read, Write, Bash, WebSearch, AskUserQuestion, TodoWrite
model: sonnet
---

# Agent Name

System prompt for the agent.

## Workflow

Steps the agent should follow.

## Error Handling

How to handle failures.
```

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Agent identifier |
| `description` | Yes | When to spawn this agent |
| `tools` | Yes | Comma-separated list of allowed tools |
| `model` | No | Model to use (`sonnet`, `opus`, `haiku`) |

### Model Selection

- `sonnet` - Default, good balance of speed and capability
- `opus` - Most capable, for complex reasoning
- `haiku` - Fastest, for simple tasks

### Example Agent

```markdown
---
name: solutions-creator
description: Create customer-specific plugins. Use when SA needs a demo plugin.
tools: Read, Write, Grep, Glob, Bash, WebSearch, AskUserQuestion
model: sonnet
---

# Solutions Creator

You help create customer-specific plugins during sales calls.

## Workflow

1. Ask 3 questions about requirements
2. Research available MCP servers
3. Generate the plugin structure
4. Create all necessary files

## Prerequisites

- miro plugin installed
- plugin-dev plugin installed
```

## Creating Hooks

Hooks are event-driven automation triggered by Claude Code events.

### hooks.json Structure

Create `.claude-plugin/hooks.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "sh ${CLAUDE_PLUGIN_ROOT}/scripts/my-hook.sh",
            "parseJson": true
          }
        ]
      }
    ]
  }
}
```

### Hook Events

| Event | Trigger |
|-------|---------|
| `PreToolUse` | Before a tool is called |
| `PostToolUse` | After a tool completes |
| `Stop` | When session is ending |
| `SessionStart` | When Claude Code starts |
| `SessionEnd` | When Claude Code closes |

### Hook Types

**Command Hook:**
```json
{
  "type": "command",
  "command": "sh ${CLAUDE_PLUGIN_ROOT}/scripts/hook.sh",
  "parseJson": true
}
```

**Prompt Hook:**
```json
{
  "type": "prompt",
  "prompt": "Check if there are pending tasks before stopping"
}
```

### Environment Variables

- `${CLAUDE_PLUGIN_ROOT}` - Path to the plugin directory
- Available in command hooks for script paths

### Hook Script Example

`scripts/hooks-stop.sh`:
```bash
#!/bin/bash

# Check configuration
CONFIG_FILE="$HOME/.miro/tracking.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo '{"enabled": false}'
  exit 0
fi

# Return JSON for Claude to process
cat "$CONFIG_FILE"
```

## MCP Integration

Configure MCP servers in `.mcp.json` at the plugin root:

```json
{
  "miro": {
    "type": "http",
    "url": "https://mcp.miro.com/",
    "headers": {
      "X-AI-Source": "my-plugin"
    }
  }
}
```

### MCP Server Types

**HTTP Server:**
```json
{
  "server-name": {
    "type": "http",
    "url": "https://mcp.example.com/",
    "headers": {}
  }
}
```

**Stdio Server:**
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

1. Create your plugin directory
2. Register with Claude Code:
   ```
   /plugin add ./path/to/my-plugin
   ```
3. Test commands and skills
4. Check logs for errors

### Validation Checklist

- [ ] `plugin.json` is valid JSON
- [ ] All commands have required frontmatter
- [ ] Skills have SKILL.md at the skill root
- [ ] Hooks return valid JSON (if `parseJson: true`)
- [ ] Scripts are executable (`chmod +x`)
- [ ] MCP servers are reachable

### Testing Commands

```
# List installed plugins
/plugin list

# Test a command
/my-plugin:my-command arg1 arg2

# Check skill activation
"Tell me about [topic from skill description]"
```

## Example Patterns

### Minimal Plugin (Command Only)

```
minimal-plugin/
├── .claude-plugin/
│   └── plugin.json
└── commands/
    └── hello.md
```

### MCP Integration Plugin

```
mcp-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json
├── commands/
│   └── query.md
└── skills/
    └── usage/
        └── SKILL.md
```

### Full-Featured Plugin

```
full-plugin/
├── .claude-plugin/
│   ├── plugin.json
│   └── hooks.json
├── .mcp.json
├── commands/
│   ├── create.md
│   ├── list.md
│   └── sync.md
├── agents/
│   └── workflow.md
├── skills/
│   └── knowledge/
│       ├── SKILL.md
│       └── references/
├── scripts/
│   └── hook.sh
└── templates/
```

## Publishing

To share your plugin:

1. Push to a GitHub repository
2. Users can install via:
   ```
   /plugin marketplace add yourname/your-repo
   /plugin install your-plugin@your-repo
   ```

## Related

- [miro plugin](miro.md) - Example of MCP integration
- [miro-tasks plugin](miro-tasks.md) - Example of hooks
- [miro-solutions plugin](miro-solutions.md) - Example of agents
