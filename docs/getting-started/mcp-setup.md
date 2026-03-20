# MCP Setup Guide

This guide covers configuring Miro MCP (Model Context Protocol) for any compatible AI client.

## Prerequisites

- An MCP-compatible AI client (Claude Code, Cursor, VSCode + Copilot, Gemini CLI, etc.)
- A Miro account with access to the boards you want to work with
- Network access to `https://mcp.miro.com/`

## Choose Your Installation Method

> **Important:** Use only **one** method per client. Combining a plugin/extension install
> with manual JSON config creates duplicate MCP servers. See the
> [Duplicate MCP Servers](https://developers.miro.com/docs/miro-mcp-server-faq-and-troubleshooting#-duplicate-mcp-servers)
> guide for details.

### Clients with Plugin / Extension Support

These clients have a dedicated Miro integration that manages the MCP connection for you. **Do not also add manual MCP config** — the plugin/extension handles it.

#### Claude Code

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

Restart Claude Code and authenticate when prompted.

If you previously configured Miro MCP manually, [remove the duplicate](https://developers.miro.com/docs/miro-mcp-server-faq-and-troubleshooting#-duplicate-mcp-servers).

For manual configuration (development only), see [CONTRIBUTING.md](../../CONTRIBUTING.md#claude-code-plugins).

#### Gemini CLI

```bash
gemini extensions install https://github.com/miroapp/miro-ai
```

Restart Gemini CLI and authenticate when prompted.

For manual configuration (development only), see [CONTRIBUTING.md](../../CONTRIBUTING.md#gemini-cli-extensions).

#### Kiro

1. Open the **Powers** panel in Kiro
2. Click **Add power from GitHub**
3. Enter: `miroapp/miro-ai` and select `powers/code-gen`

### Clients with Manual MCP Config Only

For clients that don't have a dedicated Miro plugin or extension, add this to your MCP configuration file:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

> If a Miro plugin or extension becomes available for your client later, switch to it
> and remove the manual entry to [avoid duplicate servers](https://developers.miro.com/docs/miro-mcp-server-faq-and-troubleshooting#-duplicate-mcp-servers).

#### Cursor

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

#### VSCode + GitHub Copilot

Install from the [GitHub MCP Registry](https://github.com/mcp/miroapp/mcp-server):

1. On the registry page, click **Install MCP Server**
2. Select **Install in VS Code** (or VS Code Insiders)
3. VS Code will open and prompt you to confirm the server installation
4. Complete the OAuth flow when prompted

#### Other Clients

The following clients support Miro MCP with the standard JSON configuration above:
- Windsurf
- Lovable
- Replit
- Glean
- Devin
- OpenAI Codex

Refer to each client's documentation for their specific MCP configuration file location.

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
