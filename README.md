# Miro AI Developer Tools

Official Miro AI developer tools and integrations. Connect AI agents to your Miro boards using the Model Context Protocol (MCP).

---

> ## ⚠️ Enterprise Users: Admin Approval Required
>
> **If your organization is on a Miro Enterprise plan, your admin must enable the MCP Server before you can connect.**
>
> 1. Ask your Miro admin to enable MCP Server for your organization
> 2. Admins: Follow the [Miro MCP Server Admin Guide](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide) to enable it
> 3. Review the [Beta Acknowledgement](https://help.miro.com/hc/en-us/articles/31621611644306-Miro-MCP-Server-Beta-Acknowledgement) for terms and conditions
>
> **Not on Enterprise?** You can connect directly — skip to [Quick Start](#quick-start).

---

> **Beta Release**: Miro's MCP Server is currently in beta. Features and user experience may change in future releases. [Share your feedback](https://forms.gle/feedback).

## What is Miro MCP?

Miro's MCP Server gives MCP-compatible AI clients secure access to your Miro boards. It enables AI assistants to read board context, create diagrams, and generate code while maintaining enterprise-grade security.

### Current Capabilities

| Use Case | Description |
|----------|-------------|
| **Generate Diagrams** | Create diagrams from code, PRDs, text descriptions, or GitHub URLs |
| **Generate Code** | Convert PRDs, diagrams, and prototypes into working code |

## Quick Start

### 1. Add MCP Configuration

Add this to your MCP client's configuration file:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

### 2. Connect and Authenticate

1. Open your MCP-compatible client (Cursor, Claude Code, etc.)
2. Navigate to MCP settings and add the configuration above
3. Click **Connect** to start the OAuth flow
4. Select your Miro team and click **Add**
5. You're connected! Start prompting.

> **Note**: Miro MCP is team-specific. Select the team containing the boards you want to access. If you get access errors, re-authenticate and select the correct team.

## Supported MCP Clients

Miro's MCP Server works with these MCP-compatible clients:

- [Cursor](https://cursor.sh/)
- [Claude Code](https://claude.ai/)
- [VSCode + GitHub Copilot](https://code.visualstudio.com/)
- [Gemini CLI](https://github.com/google-gemini/gemini-cli)
- [Lovable](https://lovable.dev/)
- [Replit](https://replit.com/)
- [Windsurf](https://codeium.com/windsurf)
- [Kiro](https://kiro.dev/)
- [Glean](https://glean.com/)
- [Devin](https://devin.ai/)
- [OpenAI Codex](https://openai.com/codex)

## Client-Specific Setup

<details>
<summary><strong>Cursor</strong></summary>

1. Open Cursor Settings (`Cmd/Ctrl + ,`)
2. Navigate to **Features** → **MCP Servers**
3. Click **Add Server**
4. Add the configuration:
   ```json
   {
     "miro": {
       "url": "https://mcp.miro.com/"
     }
   }
   ```
5. Click **Connect** and complete OAuth

</details>

<details>
<summary><strong>Claude Code</strong></summary>

1. Open or create `~/.claude/mcp_settings.json`
2. Add:
   ```json
   {
     "mcpServers": {
       "miro": {
         "url": "https://mcp.miro.com/"
       }
     }
   }
   ```
3. Restart Claude Code and authenticate

</details>

<details>
<summary><strong>VSCode + GitHub Copilot</strong></summary>

1. Install the MCP extension for VSCode
2. Open Command Palette (`Cmd/Ctrl + Shift + P`)
3. Run **MCP: Add Server**
4. Enter URL: `https://mcp.miro.com/`
5. Complete OAuth flow

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Add to your Gemini CLI configuration:
```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

</details>

## Claude Code Plugin Installation

For streamlined setup, you can install Miro MCP as a Claude Code plugin instead of manual configuration:

```bash
# Add the Miro plugin marketplace
/plugin marketplace add miroapp/miro-ai

# Install the Miro plugin
/plugin install miro@miro-ai
```

This automatically configures the MCP server connection. After installation, restart Claude Code and authenticate via OAuth when prompted.

**Manual Configuration**: If you prefer manual setup, see the [Claude Code section above](#claude-code).

## Available Tools & Prompts

Once connected, you'll have access to Miro MCP tools and prompts. See the full list in our documentation:

- [Miro MCP Tools & Prompts](https://developers.miro.com/docs/miro-mcp-prompts)

### Example Prompts

**Generate a diagram from code:**
```
Create a system architecture diagram on my Miro board based on 
the code in this repository
```

**Generate code from a board:**
```
Generate a Node.js application based on the PRD and wireframes 
on my Miro board [board-url]
```

## Tutorials

Learn how to use Miro MCP with these step-by-step tutorials:

| Tutorial | Description |
|----------|-------------|
| [Generate Diagrams from Code](https://developers.miro.com/docs/tutorial-how-to-generate-diagrams-from-code-w-miro-mcp-vscode-github-copilot) | VSCode + GitHub Copilot |
| [Build a Node.js App from Miro](https://developers.miro.com/docs/tutorial-build-a-nodejs-app-from-a-miro-board-with-miro-mcp-cursor) | Cursor |
| [Build a Landing Page](https://developers.miro.com/docs/tutorial-how-to-build-a-landing-page-from-a-miro-board-w-lovable-miro-mcp) | Lovable |

### Video Tutorials

Watch our [Miro MCP YouTube Playlist](https://www.youtube.com/playlist?list=PLmiHe0R4hbzSGgHWYFYwvbAKTvFPRvG2a) for video walkthroughs.

## Enterprise Users

If you're on a Miro Enterprise plan, your admin must enable MCP Server before you can use it.

**For Admins**: See the [Miro MCP Server Admin Guide](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide) for setup instructions.

**Beta Acknowledgement**: Review the [Beta Acknowledgement](https://help.miro.com/hc/en-us/articles/31621611644306-Miro-MCP-Server-Beta-Acknowledgement) for terms and conditions.

## Security

- **OAuth 2.1** — Secure authorization with dynamic client registration
- **Enterprise Compliance** — Meets enterprise security standards
- **Rate Limiting** — Protected against overuse with standard API limits
- **Permission-Based Access** — Governed by your Miro user permissions

## Troubleshooting

### Connection Issues

1. **Verify MCP support**: Ensure your AI tool supports MCP clients
2. **Check remote server support**: Some tools have MCP clients but don't support remote connections
3. **Update your tool**: Make sure you're using the latest version
4. **Network access**: Verify your network can reach `https://mcp.miro.com/`

### Authentication Errors

- **Team mismatch**: Re-authenticate and select the correct team
- **Token expired**: Disconnect and reconnect to refresh your session
- **Enterprise blocked**: Contact your admin to enable MCP Server

### Debugging

Use [MCP Inspector](https://github.com/modelcontextprotocol/inspector) for detailed connection diagnostics.

## Documentation

| Resource | Link |
|----------|------|
| MCP Overview | [developers.miro.com/docs/miro-mcp](https://developers.miro.com/docs/miro-mcp) |
| Connection Guide | [developers.miro.com/docs/connecting-to-miro-mcp](https://developers.miro.com/docs/connecting-to-miro-mcp) |
| Tools & Prompts | [developers.miro.com/docs/miro-mcp-prompts](https://developers.miro.com/docs/miro-mcp-prompts) |
| Client Setup | [developers.miro.com/docs/connecting-miro-mcp-to-ai-coding-tools](https://developers.miro.com/docs/connecting-miro-mcp-to-ai-coding-tools) |
| Admin Guide | [help.miro.com](https://help.miro.com/hc/en-us/articles/31625761037202-Miro-MCP-Server-admin-guide) |

## Feedback & Support

- **Feature Requests & Bugs**: [Open an issue](https://github.com/miroapp/miro-ai/issues)
- **Feedback Form**: [Share your feedback](https://forms.gle/feedback)
- **Community**: [Miro Developer Community](https://community.miro.com/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [Miro](https://miro.com)
