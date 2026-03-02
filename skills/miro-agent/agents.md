# Maintaining the miro-agent Skill

## When to Update

Update this skill when:
- miroctl CLI adds, removes, or changes commands or flags
- Miro MCP server adds, removes, or changes tools or parameters
- agent-browser changes commands

## Source Repos

Before updating, ask the user for the locations of:
- **miroctl repo** — contains `docs/cli-reference.md` (auto-generated from --help)
- **miro-mcp-server repo** — contains `src/server_mcp/servers/` (tool implementations)

If repos are unavailable, use live tool output:
- CLI: run `miroctl <command> --help` for each command group
- MCP: inspect tool definitions from the active MCP server connection

## Update Workflow

### 1. Detect Changes

**For miroctl:**
- Read `docs/cli-reference.md` in the miroctl repo
- Compare against `reference/miroctl.md` — look for new/changed/removed subcommands and flags
- Run `miroctl <command> --help` to verify any changes

**For MCP:**
- Read tool implementations under `src/server_mcp/servers/` in the MCP server repo
- Look for new tools, changed parameters, new enum values (e.g., diagram types)
- Compare against `reference/miro-mcp.md`

**For agent-browser:**
- Run `agent-browser --help` and compare against `reference/agent-browser.md`

### 2. Update Full References

Edit the affected full reference:
- `reference/miroctl.md` — for CLI changes
- `reference/miro-mcp.md` — for MCP changes
- `reference/agent-browser.md` — for browser changes

Keep stable section structure — each command/tool gets a `##` heading.

### 3. Update Quick References

After editing a full reference, re-read it to get current line numbers. Update every line range in the corresponding quick reference:
- `reference/miroctl-quick.md`
- `reference/miro-mcp-quick.md`
- `reference/agent-browser-quick.md`

### 4. Update SKILL.md (if needed)

Only update SKILL.md if:
- New content types added → new row in routing matrix
- Existing tool capabilities changed → routing changes
- New gotchas discovered
- Tool references section needs updating

### 5. Run Tests

```bash
# CLI smoke test + MCP verification
# Follow scripts/test-playbook.md — Part 1 (CLI) can run via bash,
# Part 2 (MCP) requires an active agent session with MCP connected.
```

Fix any failures before committing.

### 6. Verify Line Pointers

Read each quick reference and confirm every line range points to the correct section in the full reference. This is the most error-prone step — do not skip.

## File Map

| File | Purpose | When to update |
|------|---------|---------------|
| `SKILL.md` | Routing rules, gotchas, positioning | New content types or tool capabilities |
| `reference/miroctl.md` | Full CLI reference | CLI commands/flags change |
| `reference/miroctl-quick.md` | CLI index + line pointers | After any miroctl.md edit |
| `reference/miro-mcp.md` | Full MCP reference | MCP tools/params change |
| `reference/miro-mcp-quick.md` | MCP index + line pointers | After any miro-mcp.md edit |
| `reference/agent-browser.md` | Full browser reference | Browser commands change |
| `reference/agent-browser-quick.md` | Browser index + line pointers | After any agent-browser.md edit |
| `reference/tool-selection.md` | Overlap resolution, fallback chains | Routing logic changes |
| `scripts/test-playbook.md` | CLI + MCP smoke tests | New operations to test |
| `agents.md` | This file — maintenance instructions | Workflow changes |
