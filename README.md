# Miro AI Developer Tools

[![Documentation](https://img.shields.io/badge/docs-developers.miro.com-blue)](https://developers.miro.com/docs/mcp-intro)

Connect AI coding assistants to your Miro boards. Create diagrams, extract context, generate code from designs, and track tasks—all through natural conversation.

![Miro MCP Demo](assets/miro-mcp-demo.gif)

---

> **Beta Release**: Miro's MCP Server is currently in beta. [Share your feedback](https://q2oeb0jrhgi.typeform.com/to/YATmJPVx).

---

## What's in This Repository?

This repo provides everything you need to connect AI tools to Miro:

| Component | What It Does |
|-----------|--------------|
| **Miro MCP Server** | API that gives AI agents access to your Miro boards |
| **Plugins & Extensions** | Pre-built integrations for popular AI tools |
| **Documentation** | Guides for using and developing integrations |

### Supported AI Tools

| AI Tool | Integration | What You Get |
|---------|-------------|--------------|
| **Claude Code** | Plugin | Commands (`/miro:diagram`), skills, agents, hooks |
| **Gemini CLI** | Extension | MCP tools for board interaction |
| **Kiro** | Power | Design-to-code workflows |
| **Cursor, VSCode, Windsurf, etc.** | MCP Config | Direct MCP access via JSON config |

---

## Quick Start

### Step 1: Choose Your AI Tool

Select your AI tool below and follow the installation steps.

### Step 2: Install

<details open>
<summary><strong>Claude Code</strong> (Recommended)</summary>

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro@miro-ai
```

**Restart Claude Code** after installation.

See [Claude Code Plugins](docs/claude-code/overview.md) for full documentation.

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

Copy the extension file to your Gemini configuration:

```bash
mkdir -p ~/.gemini/extensions/miro
cp gemini-extension.json ~/.gemini/extensions/miro/gemini-extension.json
```

Restart Gemini CLI.

See [Gemini CLI Extension](docs/gemini-cli/overview.md) for details.

</details>

<details>
<summary><strong>Kiro</strong></summary>

Install the `code-gen` power from `powers/code-gen/`:

1. Copy `powers/code-gen/` to your Kiro powers directory
2. Configure Kiro to use the power
3. Restart Kiro

See [Kiro Powers](docs/kiro/overview.md) for details.

</details>

<details>
<summary><strong>Other MCP Clients</strong> (Cursor, VSCode, Windsurf, etc.)</summary>

Add to your MCP client configuration file:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

See [MCP Setup Guide](docs/getting-started/mcp-setup.md) for client-specific paths.

</details>

### Step 3: Authenticate

When you first use a Miro command, you'll be prompted to authenticate:

1. A browser window opens with Miro OAuth
2. Log in to your Miro account
3. Grant access to the requested boards
4. Return to your AI tool—you're connected!

### Step 4: Try It

Test your setup with these example prompts:

```
"What's on my Miro board https://miro.com/app/board/..."
```

```
"Create a flowchart on Miro showing a user login flow"
```

```
"Summarize the architecture diagram on my Miro board"
```

---

## Enterprise Users

> **Admin Approval Required**: If your organization is on a Miro Enterprise plan, your admin must enable the MCP Server before you can connect.
>
> See [Enterprise Guide](docs/getting-started/enterprise.md) for setup instructions.

---

## What Can You Do?

### Commands (Claude Code)

| Command | What It Does |
|---------|--------------|
| `/miro:browse` | Explore board contents |
| `/miro:diagram` | Create diagrams from text descriptions |
| `/miro:doc` | Create markdown documents on boards |
| `/miro:table` | Create tables with typed columns |
| `/miro:summarize` | Extract documentation from boards |
| `/miro-tasks:enable` | Enable automatic task tracking |
| `/miro-research:research` | Research topics and visualize on Miro |

### Capabilities (All Platforms)

| Capability | Description |
|------------|-------------|
| **Generate Diagrams** | Create flowcharts, sequence diagrams, ERDs from code or descriptions |
| **Generate Code** | Convert board designs and wireframes into working code |
| **Track Tasks** | Sync tasks between AI conversations and Miro tables |
| **Extract Context** | Read board content to inform AI workflows |

---

## Available Plugins

### Claude Code

| Plugin | Description |
|--------|-------------|
| [miro](docs/claude-code/miro.md) | Core MCP integration with 5 commands |
| [miro-tasks](docs/claude-code/miro-tasks.md) | Automatic task tracking in Miro tables |
| [miro-solutions](docs/claude-code/miro-solutions.md) | Create customer demo plugins |
| [miro-research](docs/claude-code/miro-research.md) | Research and visualize findings on Miro |

### Kiro

| Power | Description |
|-------|-------------|
| [code-gen](docs/kiro/code-gen.md) | Design-to-code workflows |

---

## Security

- **OAuth 2.1** secure authorization
- **Enterprise compliance** standards
- **Permission-based** access via your Miro account
- **Rate limited** API protection

---

## Documentation

### Getting Started
- [MCP Setup Guide](docs/getting-started/mcp-setup.md) — Client-specific configuration
- [Enterprise Guide](docs/getting-started/enterprise.md) — Admin setup for enterprise

### Platform Guides
- [Claude Code Plugins](docs/claude-code/overview.md)
- [Kiro Powers](docs/kiro/overview.md)
- [Gemini CLI Extension](docs/gemini-cli/overview.md)

### Reference
- [MCP Tools Reference](docs/mcp/tools-reference.md)
- [MCP Tutorials](docs/mcp/tutorials.md)
- [Troubleshooting](docs/troubleshooting.md)

### Development
- [Plugin Development Guide](docs/claude-code/plugin-development.md)
- [Power Development Guide](docs/kiro/power-development.md)
- [Contributing](CONTRIBUTING.md)

### External
- [Miro Developer Docs](https://developers.miro.com/docs/mcp-intro)

---

## Supported MCP Clients

Claude Code, Cursor, VSCode + GitHub Copilot, Gemini CLI, Lovable, Replit, Windsurf, Kiro, Glean, Devin, OpenAI Codex

---

## Feedback & Support

- **Issues & Features**: [Open an issue](https://github.com/miroapp/miro-ai/issues)
- **Feedback**: [Share your feedback](https://q2oeb0jrhgi.typeform.com/to/YATmJPVx)
- **Community**: [Miro Developer Community](https://community.miro.com/)

---

## License

MIT — see [LICENSE](LICENSE)

---

Built with love by [Miro](https://miro.com)
