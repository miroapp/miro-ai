# Kiro Powers

Kiro powers provide context and steering instructions for AI assistants working with Miro boards.

## What are Kiro Powers?

Powers are packages that configure Kiro with:

- **MCP Connections** - External services and APIs
- **Steering Instructions** - Guidance for how Kiro should work with content
- **Workflows** - Step-by-step processes for common tasks

## Why Use Powers vs Direct MCP?

| Feature | Direct MCP | Powers |
|---------|------------|--------|
| Setup | Manual configuration | Automatic setup |
| Context | Generic tool use | Domain-specific guidance |
| Workflows | Ad-hoc | Structured processes |

Powers provide Kiro with the knowledge to use MCP tools effectively for specific use cases.

## Installation

1. In Kiro, open the **Powers** panel
2. Click **Add power from GitHub**
3. Enter repository: `miroapp/miro-ai`
4. Select the power: `powers/code-gen`

For local development, see [Power Development Guide](power-development.md#local-development).

See [Kiro Powers Documentation](https://kiro.dev/docs/powers/installation/).

## Available Powers

| Power | Description |
|-------|-------------|
| [code-gen](code-gen.md) | Design-to-code workflow using Miro boards |

## Power Structure

A typical power contains:

```
power-name/
├── POWER.md      # Steering instructions and workflows
└── mcp.json      # MCP server configuration
```

## Authentication

When a power activates, Kiro prompts you to connect to required services via OAuth. For Miro:

1. Kiro will prompt you to authenticate
2. Sign in to your Miro account
3. Select the **team** containing your target boards
4. Authorize the connection

## Next Steps

- [code-gen](code-gen.md) - Design-to-code workflow
- [Power Development](power-development.md) - Build your own powers
