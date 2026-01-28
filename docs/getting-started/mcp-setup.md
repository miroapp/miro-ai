# MCP Setup Guide

This guide covers configuring Miro MCP (Model Context Protocol) for any compatible AI client.

## Prerequisites

- An MCP-compatible AI client (Claude Code, Cursor, VSCode + Copilot, Gemini CLI, etc.)
- A Miro account with access to the boards you want to work with
- Network access to `https://mcp.miro.com/`

## Basic Configuration

Add this configuration to your MCP client:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

## Client-Specific Setup

### Claude Code

**Option 1: Plugin (Recommended)**

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

Restart Claude Code and authenticate when prompted.

**Option 2: Manual Configuration**

Edit `~/.claude/mcp_settings.json`:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

### Cursor

1. Open Settings (`Cmd/Ctrl + ,`)
2. Navigate to **Features** > **MCP Servers**
3. Click **Add Server** and add:

```json
{
  "miro": {
    "url": "https://mcp.miro.com/"
  }
}
```

4. Click **Connect** and complete OAuth

### VSCode + GitHub Copilot

1. Install the MCP extension for VSCode
2. Open Command Palette (`Cmd/Ctrl + Shift + P`)
3. Run **MCP: Add Server**
4. Enter URL: `https://mcp.miro.com/`
5. Complete OAuth flow

### Gemini CLI

Add to your Gemini CLI configuration file:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

### Other Clients

The following clients support Miro MCP with standard configuration:
- Lovable
- Replit
- Windsurf
- Kiro
- Glean
- Devin
- OpenAI Codex

Refer to each client's documentation for their specific MCP configuration location.

## OAuth Authentication

When you first connect, you'll be redirected to Miro for authentication:

1. Click **Connect** in your AI client
2. Sign in to your Miro account
3. Select the **team** containing your target boards
4. Click **Add** to authorize

**Important**: Miro MCP is team-specific. You can only access boards from the team you selected during OAuth. If you need to access a different team's boards, disconnect and reconnect, selecting the correct team.

## Network Requirements

Ensure your network allows connections to:
- `https://mcp.miro.com/` - MCP server endpoint

If using a corporate proxy, configure your AI client to route traffic through the proxy.

## Verifying Your Connection

After setup, test the connection:

1. Ask your AI assistant: "List the frames on my Miro board [board-url]"
2. If successful, you'll see board content
3. If authentication fails, disconnect and reconnect

## Security

Miro MCP uses:
- **OAuth 2.1** for secure authorization
- **Permission-based access** - governed by your Miro user permissions
- **Rate limiting** - protected against overuse with standard API limits

Your AI client only has access to boards your Miro account can access.

## Next Steps

- [Enterprise Guide](enterprise.md) - For organizations on Miro Enterprise plans
- [Tools Reference](../mcp/tools-reference.md) - Learn about available MCP tools
- [Tutorials](../mcp/tutorials.md) - Step-by-step examples
