# Contributing to Miro AI

Thank you for your interest in contributing to Miro AI. This guide covers development workflows for each platform.

## Quick Links

- [Scope and Conventions](#scope-and-conventions)
- [Local Development Setup](#local-development-setup)
- [Claude Code Plugins](#claude-code-plugins)
- [Kiro Powers](#kiro-powers)
- [Gemini CLI Extensions](#gemini-cli-extensions)
- [Codex Plugins](#codex-plugins)
- [Cursor Plugins](#cursor-plugins)
- [Copilot Cowork Packages](#copilot-cowork-packages)
- [General Guidelines](#general-guidelines)

---

## Scope and Conventions

This repository ships **skills + MCP only**. We deliberately do not accept slash commands, autonomous agents, hooks, shell scripts, or template files in the source Claude plugin or in any generated downstream target.

### What we ship

| Component | Source | Generated targets |
|-----------|--------|-------------------|
| `skills/*/SKILL.md` (+ optional `references/`) | `claude-plugins/miro/skills/` | All targets — copied verbatim |
| `.mcp.json` | `claude-plugins/miro/.mcp.json` | All targets — adapted to platform-native MCP shape |
| Manifest | `claude-plugins/miro/.claude-plugin/plugin.json` | All targets — synthesized per platform |
| `README.md` | `claude-plugins/miro/README.md` | Cursor, Gemini (verbatim); Codex (generated) |

### What we do not ship

- `commands/*.md` — slash commands. Use natural-language skill activation instead.
- `agents/*.md` — autonomous subagents.
- `.claude-plugin/hooks.json`, `hooks/hooks.json` — event hooks.
- `scripts/*.sh` — shell scripts (only relevant if hooks or commands need them).
- `templates/` — template files.

The converters under `validation/src/converters/` only handle skills, MCP, and the manifest. The validators under `validation/src/` only enforce that contract. Adding a `commands/`, `agents/`, `hooks/`, `scripts/`, or `templates/` directory to the source plugin will not produce any output — the writers ignore those paths by design.

### Why this scope

- **Skills auto-activate** from natural language using their `description` field. They cover the same surface as slash commands without forcing users to memorize syntax (`/miro:browse <url>` becomes `list items on <url>`).
- **MCP** gives the model direct tool access. Hooks and scripts mostly existed to bridge gaps that MCP now fills.
- **One source of truth.** Vendors implement these primitives differently (Cursor flattens hook structure, Gemini converts commands to TOML, Codex omits commands entirely). Sticking to skills + MCP gives every target byte-identical content for the same source.
- **Smaller blast radius.** Less converter code to maintain, fewer cross-platform edge cases, no platform-specific text adaptation — source skills are authored in platform-neutral phrasing and copied verbatim to every target.

### If you need command-like behavior

Author it as a skill with a clear trigger description. The skill body can prompt for a board URL or other inputs the way a slash command would. See `claude-plugins/miro/skills/miro-browse/SKILL.md` for the canonical pattern.

If you have a use case that genuinely cannot be expressed as a skill + MCP, open a discussion before adding new component types — re-introducing commands/agents/hooks is a deliberate scope expansion, not a one-off feature add.

---

## Local Development Setup

### Prerequisites

- Git
- [Bun](https://bun.sh/) — required for validation and converters
- Your AI tool of choice (Claude Code, Cursor, Gemini CLI, Codex, Kiro)

### Clone and Setup

```bash
git clone https://github.com/miroapp/miro-ai.git
cd miro-ai
bun install
```

This installs dependencies and sets up **pre-commit hooks** automatically via Husky.

### Validation

Run validation before committing (also runs automatically on pre-commit):

```bash
bun run validate
```

| What's Validated | How |
|------------------|-----|
| Claude plugin.json files | `claude plugin validate` CLI |
| SKILL.md frontmatter | JSON schema (requires `description`) |
| Kiro POWER.md frontmatter | JSON schema (requires `name`, `displayName`, `description`, `keywords`) |
| All JSON files | Syntax validation |
| MCP configurations | URL consistency across platforms |
| Codex manifests | JSON schema + marketplace checks |
| Codex generated content | No Claude-only tool references leak through |
| Copilot Cowork package | Manifest schema + identity + skills + connectors |

**Individual validators (cross-cutting types):**

```bash
bun run validate:frontmatter     # Markdown frontmatter only
bun run validate:bash            # Bash scripts only (shellcheck)
bun run validate:consistency     # Cross-platform consistency only
bun run validate:version         # Version bump check
```

Per-plugin or per-target slices are intentionally not exposed as scripts — `bun run validate` and `bun run convert` are bulk operations. For ad-hoc debugging, call the CLI directly, e.g. `bun validation/src/index.ts --codex-only` or `bun validation/src/converters/index.ts --cursor --plugin=miro --dry-run`.

See [Validation Documentation](docs/validation/README.md) for detailed information on schemas, troubleshooting, and extending validators.

### Repository Structure

```
miro-ai/
├── .agents/
│   └── skills/             # Repo-local helper skills for Codex/agent workflows
├── claude-plugins/           # Claude Code plugins (source of truth)
│   └── miro/                # Core MCP integration with bundled skills
│       └── skills/          # browse, code-review, code-spec, diagram, doc, table
├── gemini-extension.json     # Gemini CLI extension manifest at repo root (auto-generated)
├── codex-plugins/            # Codex plugins (auto-generated)
│   └── miro/
├── .agents/plugins/          # Codex repo-local marketplace (auto-generated)
├── copilot-cowork-plugins/   # Copilot Cowork packages (auto-generated)
│   └── miro/
├── skills/                   # Agent Skills (auto-generated from claude-plugins)
├── cursor-plugins/           # Cursor plugins (auto-generated from claude-plugins)
├── powers/                   # Kiro powers
│   └── code-gen/            # Design-to-code
├── validation/               # Validators and converters
│   └── src/
│       └── converters/      # bun run convert
├── docs/                     # Documentation
│   ├── claude-code/         # Plugin docs
│   ├── kiro/                # Power docs
│   ├── gemini-cli/          # Extension docs
│   └── mcp/                 # MCP reference
└── README.md
```

Repo-local helper skills live in `.agents/skills/`. `.claude/skills` is kept as a compatibility symlink for Claude-oriented tooling.

---

## Claude Code Plugins

### Development Workflow

**Option 1: Using `--plugin-dir` (Recommended for development)**

Start Claude Code with your plugin directory loaded directly:

```bash
claude --plugin-dir ./claude-plugins/miro
```

This approach:
- Loads the plugin from your local directory
- Picks up changes when you restart Claude Code
- Doesn't require installing/uninstalling the plugin

**Option 2: Local installation with `/plugin add`**

```bash
# Install from local directory
/plugin add ./claude-plugins/miro

# Uninstall when done testing
/plugin uninstall miro
```

### Testing Plugins Locally

1. **Start Claude Code with your plugin:**
   ```bash
   claude --plugin-dir ./claude-plugins/miro
   ```

2. **Verify the plugin loaded:**
   ```
   /plugin list
   ```
   You should see your plugin in the list.

3. **Test skill activation:**
   Ask a question that should trigger the skill:
   ```
   "create a flowchart on https://miro.com/app/board/test= for the user login flow"
   "list frames on https://miro.com/app/board/test="
   ```
   The skill matching the request should activate without any `/` invocation.

### Testing the Marketplace Locally

If you're modifying `.claude-plugin/marketplace.json`:

1. **Add local marketplace:**
   ```bash
   /plugin marketplace add /path/to/miro-ai
   ```

2. **Install plugins from it:**
   ```bash
   /plugin install miro@miro-ai
   ```

3. **Verify all plugins appear:**
   ```bash
   /plugin marketplace list
   ```

4. **Validate JSON:**
   ```bash
   claude plugin validate .
   ```

### Making Changes

1. Edit files in `claude-plugins/your-plugin/`
2. Restart Claude Code to pick up changes
3. Test the affected functionality
4. Repeat until working

### Plugin Structure Reference

The miro plugin is intentionally minimal — see [Scope and Conventions](#scope-and-conventions).

```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest (required)
├── .mcp.json                # MCP server config
├── skills/                  # Knowledge skills with auto-activation
│   └── skill-name/
│       ├── SKILL.md
│       └── references/      # (optional)
└── README.md                # User-facing readme (optional)
```

`commands/`, `agents/`, `hooks/`, `scripts/`, and `templates/` are not part of this repo's convention. Adding them produces no output — the converter ignores those directories.

### Validation Checklist

Before submitting a PR, run `bun run validate` to automatically check:

- [x] `plugin.json` is valid JSON and matches Claude's plugin schema
- [x] Each `SKILL.md` has `name` and `description` in frontmatter, and `name` matches the directory
- [x] All skill directory names start with `miro-` (enforced)
- [x] `.mcp.json` is valid JSON and the MCP URL is consistent with downstream targets
- [x] No Claude-only tool names (`Write tool`, `TaskCreate`, `AskUserQuestion`, …) leak into Codex output

**Manual verification still needed:**

- [ ] MCP server is reachable from your environment
- [ ] Each skill activates from its triggering phrase

### Debugging Tips

**Plugin not loading?**
- Check `plugin.json` syntax with `cat plugin.json | jq .`
- Ensure you're using the correct path with `--plugin-dir`

**Skill not activating?**
- Make sure `SKILL.md` exists at the skill root and `name` matches the directory
- Check that the `description` field contains the trigger keywords the user is likely to use
- The user phrasing should match the skill's "Use when..." description, not the skill name

**MCP tools missing?**
- Confirm `.mcp.json` is valid JSON and the URL is reachable
- Re-authenticate if the OAuth token has expired

---

## Kiro Powers

### Development Workflow

1. **Create or edit power directory:**
   ```bash
   # Powers live in the powers/ directory
   cd powers/code-gen
   ```

2. **Power files:**
   - `POWER.md` — Steering instructions for the AI (required)
   - `mcp.json` — MCP server configuration (optional, only needed for MCP tools)

3. **Test with Kiro using Local Path:**
   - In Kiro, open the **Powers** panel
   - Click **Add power from Local Path**
   - Select your power directory (e.g., `miro-ai/powers/code-gen/`)
   - Test with sample prompts

### Power Structure Reference

```
power-name/
├── POWER.md     # Steering instructions (required)
└── mcp.json     # MCP configuration (optional)
```

### POWER.md Format

```markdown
---
name: "power-name"
displayName: "Human Readable Name"
description: "What this power does"
keywords: ["keyword1", "keyword2", "keyword3"]
---

# Power Name

Steering instructions for the AI.

## Onboarding

Setup and authentication steps.

## Workflow

Steps the AI should follow.
```

**Required frontmatter fields:** `name`, `displayName`, `description`, `keywords`

### Validation Checklist

Run `bun run validate` to automatically check:

- [x] `POWER.md` has valid YAML frontmatter (`name`, `displayName`, `description`, `keywords`)
- [x] `mcp.json` is valid JSON

**Manual verification still needed:**

- [ ] MCP server is reachable
- [ ] Steering instructions are clear and actionable

---

## Gemini CLI Extension

Per Gemini CLI's [extension model](https://geminicli.com/docs/extensions/reference/), the repo root **is** the extension. `bun run convert` regenerates `gemini-extension.json` at the root from the source Claude plugin's manifest and `.mcp.json`. Skills come from the same root-level `skills/` directory used by the agent-skills mirror — no per-extension copy.

### Development Workflow

1. **Edit the source Claude plugin:**
   ```bash
   vim claude-plugins/miro/skills/miro-browse/SKILL.md
   ```

2. **Regenerate all targets (bulk):**
   ```bash
   bun run convert
   ```
   For ad-hoc debugging of a single target/plugin, call the CLI directly:
   ```bash
   bun validation/src/converters/index.ts --gemini --plugin=miro --dry-run
   ```

3. **Link the repo root for local testing:**
   ```bash
   gemini extensions link .
   ```

4. **Restart Gemini CLI**

5. **Test:**
   - Verify the extension loads in Gemini CLI
   - Verify MCP tools are accessible
   - Trigger a skill via natural language

### Extension Surface

```
miro-ai/                     # Repo root = Gemini extension root
├── gemini-extension.json    # Manifest with MCP config (auto-generated)
└── skills/                  # 6 skills, byte-identical to source
```

### Validation Checklist

Run `bun run validate` to automatically check:

- [x] JSON is valid
- [x] MCP server URL is consistent with other platforms
- [x] `X-AI-Source` header is `gemini-extension`

**Manual verification still needed:**

- [ ] Extension loads in Gemini CLI
- [ ] MCP tools work end-to-end
- [ ] Each skill activates from its triggering phrase

---

## Agent Skills

See [Agent Skills Overview](docs/agent-skills/overview.md) for user-facing documentation.

Skills are auto-generated from Claude plugin skills as part of the bulk `bun run convert` pipeline. They live in `skills/*/` following the [agentskills.io specification](https://agentskills.io/specification).

### Development Workflow

1. **Edit the source Claude plugin skill:**
   ```bash
   vim claude-plugins/miro/skills/miro-browse/SKILL.md
   ```

2. **Regenerate all targets (bulk):**
   ```bash
   bun run convert
   ```
   For ad-hoc debugging of just the skills target, call the CLI directly:
   ```bash
   bun validation/src/converters/index.ts --skills --dry-run
   ```

3. **Test locally:**
   ```bash
   npx skills add ./
   ```

### Naming Convention

All skill directory names under `claude-plugins/` must start with `miro-` (enforced by validation). This ensures unique names when published as Agent Skills.

---

## Codex Plugins

See [Codex Plugins Overview](docs/codex/overview.md) for the generated platform reference.

Plugins are auto-generated from Claude plugins as part of the bulk `bun run convert` pipeline. The Codex target is intentionally narrow: it generates only `codex-plugins/miro/` plus a repo-local marketplace at `.agents/plugins/marketplace.json`.

### Development Workflow

1. **Edit the source Claude plugin:**
   ```bash
   vim claude-plugins/miro/skills/miro-browse/SKILL.md
   ```

2. **Regenerate all targets (bulk):**
   ```bash
   bun run convert
   ```
   For ad-hoc debugging of just the Codex target, call the CLI directly:
   ```bash
   bun validation/src/converters/index.ts --codex --dry-run
   ```

3. **Validate generated output:**
   ```bash
   bun run validate
   ```
   Or scope to consistency only with `bun run validate:consistency`.

4. **Test in Codex:**
   - Open the repository in Codex so it can discover `.agents/plugins/marketplace.json`
   - Install the generated `miro` plugin from the `miro-ai` marketplace
   - Verify plugin `$` skills appear for `$miro:miro-browse`
   - Verify the Codex slash menu still shows only built-in commands

### Plugin Structure

The generated Codex output in `codex-plugins/miro/`:

```
miro/
├── .codex-plugin/plugin.json  # Codex manifest
├── skills/                    # Converted native skills
├── .mcp.json                  # MCP config (miro only)
└── README.md                  # Generated platform README
```

### Notes

- Codex plugins do not support a `commands` manifest component. This repository does not convert Claude commands for Codex.
- Codex CLI slash commands are built-ins. Use `$miro:<skill-name>` plus the Miro MCP tools.
- Only `codex-plugins/miro/.mcp.json` and `codex-plugins/miro/skills/` should exist in generated Codex output.

---

## Cursor Plugins

See [Cursor Plugins Overview](docs/cursor/overview.md) for user-facing documentation.

Plugins are auto-generated from Claude plugins as part of the bulk `bun run convert` pipeline. They live in `cursor-plugins/*/` with `.cursor-plugin/plugin.json`, `.mcp.json`, and `skills/` only. Per [Scope and Conventions](#scope-and-conventions), no commands, agents, or hooks are emitted.

### Development Workflow

1. **Edit the source Claude plugin:**
   ```bash
   vim claude-plugins/miro/skills/miro-diagram/SKILL.md
   ```

2. **Regenerate all targets (bulk):**
   ```bash
   bun run convert
   ```
   For ad-hoc debugging of just the Cursor target, call the CLI directly:
   ```bash
   bun validation/src/converters/index.ts --cursor --plugin=miro --dry-run
   ```

3. **Copy to local plugins dir and restart Cursor:**
   ```bash
   cp -r cursor-plugins/miro ~/.cursor/plugins/miro
   # Restart Cursor (or Cmd+Shift+P → Reload Window)
   ```

4. Verify plugins load and test MCP connection.

> **Note:** Local plugin loading is a [community workaround](https://forum.cursor.com/t/cursor-2-5-plugins/152124), not officially documented. The official install method is via the Cursor Marketplace (`/add-plugin`).

---

## Copilot Cowork Packages

Copilot Cowork packages are auto-generated from Claude plugins. Only the `miro` plugin is converted for this target. The generated package folder lives in `copilot-cowork-plugins/miro/` and is committed to the repo. Cowork icons under `assets/copilot-cowork/` are packaging assets, not Claude plugin source files.

This section documents the developer workflow for generating, validating, and packaging the Cowork app package. The committed folder under `copilot-cowork-plugins/miro/` and the zip created in `dist/` are packaging artifacts, not a public end-user installation path.

### Development Workflow

1. **Edit the source Claude plugin:**
   ```bash
   vim claude-plugins/miro/skills/miro-browse/SKILL.md
   ```

2. **Keep the required Cowork icons in the package asset folder:**
   ```bash
   ls assets/copilot-cowork/miro/color.png assets/copilot-cowork/miro/outline.png
   ```

3. **Regenerate all targets (bulk):**
   ```bash
   bun run convert
   ```
   For ad-hoc debugging of just the Cowork target, call the CLI directly:
   ```bash
   bun validation/src/converters/index.ts --copilot-cowork --dry-run
   ```

4. **Create the local zip archive:**
   ```bash
   bun run package:copilot-cowork
   ```
   This writes `dist/miro-copilot-cowork-<version>.zip`. The `dist/` directory is gitignored, so local archives never show up in commits.

5. **Validate before committing:**
   ```bash
   bun run validate
   ```

6. **After merge to `main`, download the generated zip artifact from GitHub Actions.**
   You can also trigger the same packaging flow manually from the Actions UI with `Run workflow`.

### Copilot Naming and Identity Mapping

Copilot branding is separate from the source Claude plugin key. For `miro`, the mapping is fixed and must stay stable across rebuilds. Cowork-specific display text comes from the Cowork config, not from the source Claude plugin manifest.

- source plugin key and output folder: `miro`
- Copilot display name: `Miro Cowork`
- Copilot description source: `validation/src/copilot-cowork-config.ts`
- stable manifest `id`: `1b72f048-929d-554f-9995-9bc8e90f4c4f`
- stable manifest `packageName`: `com.cowork.plugin.miro`
- stable connector `id`: `miro`
- stable connector `authorization.referenceId`: `miro-miro-auth`

The converter always writes the Copilot brand as `Miro Cowork`, but it must not regenerate new IDs when `copilot-cowork-plugins/miro/manifest.json` already exists. If the generated manifest is missing, the converter bootstraps the same canonical IDs from the fixed Copilot mapping above.

### Package Contents

The generated package artifacts include:

- `manifest.json`
- `color.png`
- `outline.png`
- `skills/`
- a local distributable zip via `bun run package:copilot-cowork`

---

## General Guidelines

### Code Style

- Use clear, descriptive names
- Add comments for complex logic
- Follow existing patterns in the codebase

### Documentation

- Update docs when changing functionality
- Include practical examples
- Verify all links resolve correctly

### Reporting Bugs

1. Search [existing issues](https://github.com/miroapp/miro-ai/issues) to avoid duplicates
2. Open a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, AI tool, versions)

### Requesting Features

1. Open an issue describing the feature
2. Explain the use case and benefits
3. Include examples if possible

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Test thoroughly using the workflows above
5. Submit a pull request with:
   - Clear description of changes
   - Reference to related issues
   - Test steps you performed
   - Screenshots if UI-related

---

## Questions?

- Open a [discussion](https://github.com/miroapp/miro-ai/discussions)
- Join the [Miro Developer Community](https://community.miro.com/)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
