# Miro AI Developer Tools

[![Documentation](https://img.shields.io/badge/docs-developers.miro.com-blue)](https://developers.miro.com/docs/mcp-intro)

Connect AI coding assistants to your Miro boards. Create diagrams, extract context, generate code from designs, and track tasks—all through natural conversation. 

![Gemini CLI docs, diagram, table demo](https://github.com/user-attachments/assets/54cb6aa9-9174-4d23-91a2-3cb4caa69d3d)

---

> [Share your feedback](https://q2oeb0jrhgi.typeform.com/to/YATmJPVx).

---

## What's in This Repository?

This repo provides everything you need to connect AI tools to Miro:

| Component | What It Does |
|-----------|--------------|
| **Miro MCP Server** | API that gives AI agents access to your Miro boards |
| **Plugins & Extensions** | Pre-built integrations for popular AI tools |
| **Documentation** | Guides for using and developing integrations |

### Supported AI Tools

| AI Tool | Integration |
|---------|-------------|
| **Claude Code** | Plugins |
| **Gemini CLI** | Extensions |
| **Kiro** | Power |
| **Cursor** | Plugins |
| **Agent Skills** | Skills |
| **VSCode, Windsurf, etc.** | MCP Config |

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

Optional plugins:

```bash
/plugin install miro-tasks@miro-ai      # Task tracking in Miro tables
/plugin install miro-solutions@miro-ai   # Demo plugin generator
/plugin install miro-research@miro-ai    # Research visualization
/plugin install miro-review@miro-ai      # Code review workflows
```

**Restart Claude Code** after installation. If you previously configured Miro MCP manually, [remove the duplicate](docs/troubleshooting.md#duplicate-mcp-servers) to avoid conflicts — the plugin already manages the MCP connection for you.

See [Claude Code Plugins](docs/claude-code/overview.md) for full documentation.

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

**Quick start** — install the root extension for MCP access:

```bash
gemini extensions install https://github.com/miroapp/miro-ai
```

This installs the root `gemini-extension.json`, which gives Gemini access to the Miro MCP server (board reading, diagrams, tables, docs).

**Full install** — for commands, skills, and hooks, clone the repo and install individual extensions:

```bash
git clone https://github.com/miroapp/miro-ai.git
gemini extensions install ./miro-ai/gemini-extensions/miro
gemini extensions install ./miro-ai/gemini-extensions/miro-tasks
gemini extensions install ./miro-ai/gemini-extensions/miro-research
gemini extensions install ./miro-ai/gemini-extensions/miro-review
```

Restart Gemini CLI and authenticate when prompted.

See [Gemini CLI Extension](docs/gemini-cli/overview.md) | [Official Docs](https://geminicli.com/docs/extensions/)

</details>

<details>
<summary><strong>Kiro</strong></summary>

1. Open the **Powers** panel in Kiro
2. Click **Add power from GitHub**
3. Enter: `miroapp/miro-ai` and select `powers/code-gen`

For local development, see [CONTRIBUTING.md](CONTRIBUTING.md#kiro-powers).

See [Kiro Powers](docs/kiro/overview.md) | [Official Docs](https://kiro.dev/docs/powers/installation/)

</details>

<details>
<summary><strong>Agent Skills</strong> (agentskills.io)</summary>

Portable knowledge skills that work across AI coding tools (Claude Code, Cursor, VS Code + Copilot, Codex, etc.).

```bash
npx skills add miroapp/miro-ai            # Interactive install
npx skills add miroapp/miro-ai --list     # List available skills
npx skills add miroapp/miro-ai --skill=miro-mcp  # Install specific skill
```

Available skills: **miro-mcp**, **miro-platform**, **miro-code-review**

See [Agent Skills Overview](docs/agent-skills/overview.md) | [agentskills.io](https://agentskills.io)

</details>

<details>
<summary><strong>Cursor</strong></summary>

**Marketplace** (recommended):
1. In Cursor, run `/add-plugin` and search for "Miro"
2. Or browse [cursor.com/marketplace](https://cursor.com/marketplace)

**Local development** (not officially documented — [community workaround](https://forum.cursor.com/t/cursor-2-5-plugins/152124)):

```bash
git clone https://github.com/miroapp/miro-ai.git
cp -r miro-ai/cursor-plugins/miro ~/.cursor/plugins/miro
# Restart Cursor
```

> **Important:** If you previously added Miro MCP manually (via Settings > MCP Servers),
> remove that entry — the plugin already manages the MCP connection for you.
> See [Avoiding Duplicate Servers](#avoiding-duplicate-servers).

See [Cursor Plugins](docs/cursor/overview.md) for full documentation.

</details>

<details>
<summary><strong>Other MCP Clients</strong> (VSCode + Copilot, Windsurf, Lovable, Replit, etc.)</summary>

For clients that don't have a dedicated Miro plugin or extension, add to your MCP client configuration file:

```json
{
  "mcpServers": {
    "miro": {
      "url": "https://mcp.miro.com/"
    }
  }
}
```

> **Note:** If a Miro plugin or extension becomes available for your client later,
> switch to it and remove the manual entry to avoid duplicate servers.

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

### Developer Mode

Want to modify plugins, test changes locally, or build your own? See [CONTRIBUTING.md](CONTRIBUTING.md#local-development-setup) for dev setup instructions.

### Avoiding Duplicate Servers

Each installation method (plugin/extension, manual JSON config, local dev server) creates an **independent MCP connection** with its own OAuth session. Running more than one at a time causes duplicate tools, repeated auth prompts, and confused AI responses.

**Rules of thumb:**

1. **If your client has a Miro plugin or extension** (Claude Code, Cursor, Gemini CLI, Kiro) — use only that. Do not also add `https://mcp.miro.com/` to your MCP config manually.
2. **If your client has no plugin** (VSCode + Copilot, Windsurf, etc.) — manual config is the correct approach. If a plugin becomes available later, switch to it and remove the manual entry.
3. **If you're running a local dev server** — add it at **project scope** with a distinct name (e.g., `miro-local`) so it doesn't collide with the production server.

See [Troubleshooting: Duplicate Servers](docs/troubleshooting.md#duplicate-mcp-servers) for diagnosis and cleanup steps.

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
| miro-review | Visual code reviews on Miro boards |

### Gemini CLI

| Extension | Description |
|-----------|-------------|
| miro | Core MCP integration with commands and skills |
| miro-tasks | Task tracking commands |
| miro-research | Research visualization |
| miro-review | Code review workflows |

### Cursor

| Plugin | Description |
|--------|-------------|
| miro | Core MCP integration with 5 commands and skills |
| miro-tasks | Task tracking with hooks and scripts |
| miro-research | Research visualization with MCP |
| miro-review | Code review workflows |
| miro-spec | Design spec extraction |

### Agent Skills

| Skill | Description |
|-------|-------------|
| miro-mcp | Miro MCP tools — diagrams, documents, tables, context extraction |
| miro-platform | Miro platform overview — canvas features, content types, AI capabilities |
| miro-code-review | Code review workflows using Miro boards |

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
- [Gemini CLI Extension](docs/gemini-cli/overview.md)
- [Cursor Plugins](docs/cursor/overview.md)
- [Agent Skills](docs/agent-skills/overview.md)
- [Kiro Powers](docs/kiro/overview.md)

### Reference
- [MCP Tools Reference](docs/mcp/tools-reference.md)
- [MCP Tutorials](docs/mcp/tutorials.md)
- [Troubleshooting](docs/troubleshooting.md)

### Development
- [Plugin Development Guide](docs/claude-code/plugin-development.md)
- [Power Development Guide](docs/kiro/power-development.md)
- [Validation](docs/validation/README.md)
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
