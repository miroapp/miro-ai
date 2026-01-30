
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
├── validation/               # Validation scripts and schemas
│   ├── schemas/             # JSON schemas for frontmatter
│   └── src/                 # TypeScript validators
├── docs/                     # Documentation
├── .claude-plugin/           # Marketplace manifest
├── gemini-extension.json     # Gemini CLI extension
├── package.json              # Bun project config
└── CONTRIBUTING.md
```

# Validation

Run before committing (also runs automatically via pre-commit hook):

```bash
bun run validate
```

Validates: plugin.json, frontmatter (SKILL.md, commands, agents, POWER.md), bash scripts, JSON syntax, MCP consistency.
