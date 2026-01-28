
Miro AI Developer Tools - A plugin/integration repository connecting AI coding assistants (Claude Code, Gemini CLI, Kiro, and other MCP clients) to Miro boards. This is primarily a **documentation and configuration repository** - not a traditional compiled codebase.

# CRITICAL

- NO code without vendor documentation check first.
- Make sure you understand how Claude Code plugins work by reading the relevant MCP documentation.
- Reduce the level of verbosity in your response to be concise and to the point.
- You must provide clear, direct answers and avoid unnecessary explanations or elaborations.
- Use diagrams, tables, or bullet points to explain.
- Provide working code and references to it instead of code snippets.
- Keep architecture implementation simple, concise, performant, and modular.
- Use conventional commits

# Repository Structure

```
miro-ai/
├── claude-plugins/           # Claude Code plugins
│   ├── miro/                # Core MCP integration (commands, skills)
│   ├── miro-tasks/          # Task tracking with hooks and scripts
│   ├── miro-solutions/      # Demo plugin generator (agents, templates)
│   └── miro-research/       # Research visualization
├── powers/                   # Kiro powers
│   └── code-gen/            # Design-to-code (POWER.md + mcp.json)
├── docs/                     # Documentation
├── .claude-plugin/           # Marketplace manifest
├── gemini-extension.json     # Gemini CLI extension
└── CONTRIBUTING.md
└── README.md
```

# Validation Checklist

Before committing changes:
- `plugin.json` is valid JSON
- All commands have `description` in frontmatter
- Skills have `SKILL.md` with `name` and `description` frontmatter
- Hooks return valid JSON if `parseJson: true`
- Scripts are executable (`chmod +x scripts/*.sh`)
- MCP servers are reachable
