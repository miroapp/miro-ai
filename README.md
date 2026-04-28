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
| **Codex** | Local plugins |
| **Kiro** | Power |
| **Agent Skills** | Skills |
| **Cursor, VSCode, Windsurf, etc.** | MCP Config |

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

The `miro` plugin bundles all skills (browse, code-review, code-spec, diagram, doc, table) and the Miro MCP server.

**Restart Claude Code** after installation. If you previously configured Miro MCP manually, [remove the duplicate](https://developers.miro.com/docs/miro-mcp-server-faq-and-troubleshooting#-duplicate-mcp-servers) to avoid conflicts — the plugin already manages the MCP connection for you.

See [Claude Code Plugins](docs/claude-code/overview.md) for full documentation.

</details>

<details>
<summary><strong>Gemini CLI</strong></summary>

**Quick start** — install the root extension for MCP access:

```bash
gemini extensions install https://github.com/miroapp/miro-ai
```

This installs the root `gemini-extension.json`, which gives Gemini access to the Miro MCP server (board reading, diagrams, tables, docs).

**Full install** — for skills and bundled MCP config, clone the repo and install the extension:

```bash
git clone https://github.com/miroapp/miro-ai.git
gemini extensions install ./miro-ai/gemini-extensions/miro
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
npx skills add miroapp/miro-ai                       # Interactive install
npx skills add miroapp/miro-ai --list                # List available skills
npx skills add miroapp/miro-ai --skill=miro-browse   # Install specific skill
```

Available skills: **miro-browse**, **miro-code-review**, **miro-code-spec**, **miro-diagram**, **miro-doc**, **miro-table**

See [Agent Skills Overview](docs/agent-skills/overview.md) | [agentskills.io](https://agentskills.io)

</details>

<details>
<summary><strong>Other MCP Clients</strong> (Cursor, VSCode + Copilot, Windsurf, Lovable, Replit, etc.)</summary>

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

Codex plugins are generated locally into `codex-plugins/*/` with the repo marketplace at `.agents/plugins/marketplace.json`. See [Codex Plugins](docs/codex/overview.md) for the generated structure and [CONTRIBUTING.md](CONTRIBUTING.md#codex-plugins) for regeneration and local testing.

### Avoiding Duplicate Servers

If your client has a Miro plugin or extension, use **only** that — do not also add `https://mcp.miro.com/` manually. Each installation method creates an independent MCP connection with its own OAuth session, and running more than one causes duplicate tools and auth confusion.

See the [Duplicate MCP Servers](https://developers.miro.com/docs/miro-mcp-server-faq-and-troubleshooting#-duplicate-mcp-servers) guide in Miro's Developer docs for diagnosis and cleanup steps.

---

## Enterprise Users

> **Admin Approval Required**: If your organization is on a Miro Enterprise plan, your admin must enable the MCP Server before you can connect.
>
> See [Enterprise Guide](docs/getting-started/enterprise.md) for setup instructions.

---

## What Can You Do?

### Skills (Claude Code)

Skills auto-activate when you describe what you want naturally. No slash commands required — just include a Miro board URL.

| Skill | Triggers On |
|-------|-------------|
| `miro-browse` | "List the frames on …", "What's on this board …" |
| `miro-code-review` | "Review PR 123 on …", "Visual review of this branch on …" |
| `miro-code-spec` | "Extract specs from …", "Pull the design docs at …" |
| `miro-diagram` | "Create a flowchart on …", "Add a sequence diagram to …" |
| `miro-doc` | "Add a markdown doc to …", "Write a sprint plan on …" |
| `miro-table` | "Make a task tracker table on …", "Sync these rows to …" |

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
| [miro](docs/claude-code/miro.md) | Core MCP integration with 6 bundled skills (browse, code-review, code-spec, diagram, doc, table) |

### Gemini CLI

| Extension | Description |
|-----------|-------------|
| miro | Core MCP integration with bundled skills |

### Codex

| Plugin | Description |
|--------|-------------|
| miro | Core MCP integration with native `$miro:<skill>` activation and MCP access |

### Agent Skills

| Skill | Description |
|-------|-------------|
| miro-browse | List, filter, summarize items on a Miro board |
| miro-code-review | Visual code review from PRs, local changes, or branch comparisons |
| miro-code-spec | Extract Miro specs (docs, diagrams, prototypes, tables, images) to `.miro/specs/` |
| miro-diagram | Create diagrams (flowchart, mindmap, UML, ER) from text or Mermaid |
| miro-doc | Create and edit markdown documents on a Miro board |
| miro-table | Create, populate, and sync structured tables on a Miro board |

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
