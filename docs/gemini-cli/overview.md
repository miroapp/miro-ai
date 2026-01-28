# Gemini CLI Extension

Connect Gemini CLI to Miro boards using the MCP extension.

## Overview

The Gemini CLI extension provides Miro MCP integration, enabling Gemini to:

- Read board content and context
- Create diagrams, documents, and tables
- Generate code from board designs

## Extension File

The extension is defined in `gemini-extension.json` at the repository root:

```json
{
  "name": "Miro",
  "version": "1.0.0",
  "description": "Secure access to Miro boards. Enables AI to read board context, create diagrams, and generate code with enterprise-grade security.",
  "mcpServers": {
    "miro": {
      "httpUrl": "https://mcp.miro.com/",
      "oauth": {
        "enabled": true
      },
      "headers": {
        "X-AI-Source": "gemini-extension"
      }
    }
  }
}
```

## Installation

### Using the Extension

1. Copy `gemini-extension.json` to your Gemini CLI configuration directory
2. Or add the MCP server configuration to your existing settings:

```json
{
  "mcpServers": {
    "miro": {
      "httpUrl": "https://mcp.miro.com/",
      "oauth": {
        "enabled": true
      }
    }
  }
}
```

### Authentication

On first use:
1. Gemini will prompt you to authenticate with Miro
2. Sign in to your Miro account
3. Select the team containing your target boards
4. Authorize the connection

## Available Capabilities

The extension provides access to all Miro MCP tools:

### Content Creation
- Create flowcharts, mind maps, UML diagrams
- Generate markdown documents on boards
- Create tables with typed columns

### Content Reading
- List board items by type
- Extract documentation from frames
- Read table data with filtering

### Context Extraction
- Generate project summaries
- Extract design specifications
- Get technical requirements

## Usage Examples

Once configured, you can interact with Miro boards:

```
# Create a diagram
"Create a flowchart on https://miro.com/app/board/abc= showing the user registration process"

# Read board content
"What's on my Miro board https://miro.com/app/board/abc=?"

# Generate documentation
"Extract the design requirements from the wireframes on my Miro board"
```

## Configuration Fields

| Field | Description |
|-------|-------------|
| `name` | Extension display name |
| `version` | Extension version |
| `description` | What the extension provides |
| `mcpServers` | MCP server configurations |

### MCP Server Fields

| Field | Description |
|-------|-------------|
| `httpUrl` | MCP server endpoint |
| `oauth.enabled` | Enable OAuth authentication |
| `headers` | Custom HTTP headers |

## Differences from Claude Code

| Feature | Gemini CLI | Claude Code |
|---------|------------|-------------|
| Configuration | JSON extension file | Plugin system |
| Commands | None (use prompts) | Slash commands |
| Skills | None | Knowledge skills |
| Automation | None | Hooks and agents |

Gemini CLI provides basic MCP integration. For advanced features like slash commands and skills, see [Claude Code](../claude-code/overview.md).

## Troubleshooting

### Authentication Issues

- Ensure OAuth is enabled in your configuration
- Try re-authenticating if tokens expire
- Verify you selected the correct team

### Connection Issues

- Check network access to `https://mcp.miro.com/`
- Verify the extension file is valid JSON
- Ensure Gemini CLI supports MCP extensions

## Related

- [MCP Setup Guide](../getting-started/mcp-setup.md) - General MCP configuration
- [Tools Reference](../mcp/tools-reference.md) - Available MCP tools
- [Tutorials](../mcp/tutorials.md) - Example workflows
