---
name: miro-agent
description: Routes Miro board interactions to the optimal tool automatically. Uses Miro MCP server for content intelligence (docs, diagrams, tables, board context), miroctl CLI for full API CRUD (frames, shapes, images, uploads, boards, teams), and agent-browser for visual capture (screenshots, web interaction). Use when working with Miro boards, creating or reading board content, uploading images, capturing screenshots, or managing Miro resources.
---

# Interacting with Miro

This skill routes Miro tasks to the right tool. The user describes what they want; the agent picks the tool.

- **Miro MCP** — content intelligence: explore boards, create docs/diagrams/tables, AI-powered context
- **miroctl** — full Miro API: CRUD all item types, file uploads, frames, boards, teams, bulk ops
- **agent-browser** — visual capture: screenshots, web navigation, DOM interaction

## Preflight

Run once at the start of any Miro session. Do not skip steps.

### Step 1: Check miroctl and agent-browser

```bash
bash scripts/preflight.sh
```

Returns JSON with install/auth status. Handle failures:

| Status                      | Action                                                                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| miroctl not installed       | `brew install miroapp-dev/tap/miroctl`                                                                                                                                                              |
| miroctl no token            | Ask user: "Go to https://developers.miro.com/reference/get-access-token-context, click **Get access token**, select your team, and paste the token here." Then run `miroctl auth set-token <TOKEN>` |
| miroctl token expired       | Same as above — token lasts 1 hour                                                                                                                                                                  |
| agent-browser not installed | `bun install -g agent-browser && agent-browser install`                                                                                                                                             |
| agent-browser not in PATH   | Add `~/.bun/bin` to PATH or use full path `~/.bun/bin/agent-browser`                                                                                                                                |

### Step 2: Check MCP

The preflight JSON includes `"mcp": {"checked": false, ...}`. You **must** verify MCP now using `board_list_items` — this is the **only** valid test. Do NOT use `context_explore` or `context_get` — those use narrower OAuth scopes and can pass even when the token lacks read/write permissions.

```
board_list_items(board_id="<any_board_url>", limit=1)
```

| Result                                | Action                                                                                                                                                                                                                                                                                 |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tool not found                        | **STOP.** MCP server not configured. Tell user: _"Miro MCP server is not connected. Add this to your MCP settings and restart the connection: `{"miro": {"type": "http", "url": "https://mcp.miro.com"}}`"_                                                                            |
| "Board access denied"                 | **STOP.** OAuth token lacks required scopes. Tell user: _"Miro MCP connected but missing board permissions. Remove the MCP server, re-add it, and restart the connection to re-authorize with full scopes. Make sure to grant board read/write access when the OAuth prompt appears."_ |
| Auth error / 401 / 403                | **STOP.** Tell user: _"Miro MCP needs authentication. Restart the MCP connection — this will open a browser window for OAuth login."_                                                                                                                                                  |
| Any other error                       | **STOP.** Show the error to the user and ask them to fix MCP connectivity before continuing.                                                                                                                                                                                           |
| Success (returns items or empty list) | MCP ready — proceed.                                                                                                                                                                                                                                                                   |

**STOP means:** Do not continue with any Miro operations. The skill cannot function without MCP.

**Note:** The MCP tool prefix depends on the server name in the user's config. It may be `miro:`, `miro-mcp:`, or another prefix. Use whatever prefix the tools are registered under.

## Tool Routing

### Quick Rules

**Create** — MCP: docs, diagrams, tables. CLI: everything else.
**Read** — MCP first (content intelligence). CLI fallback (raw JSON, positions, styles).
**Update** — MCP: doc content, table rows. CLI: position, parent, style, delete.
**Upload** — CLI only (images, documents, bulk).
**Visual capture** — agent-browser only.

For fallback chains and overlap resolution, see [reference/tool-selection.md](reference/tool-selection.md).

### Routing Matrix

| Content       | Create                      | Read                          | Update/Delete                      |
| ------------- | --------------------------- | ----------------------------- | ---------------------------------- |
| Document      | MCP `doc_create`            | MCP `doc_get`                 | MCP `doc_update` / CLI delete      |
| Diagram       | MCP `diagram_create`\*      | MCP `context_get`             | CLI delete                         |
| Table         | MCP `table_create`          | MCP `table_list_rows`         | MCP `table_sync_rows` / CLI delete |
| Frame         | CLI `frames create`\*\*     | MCP `board_list_items` or CLI | CLI `frames update` / delete       |
| Sticky note   | CLI `sticky-notes create`   | MCP or CLI                    | CLI update / delete                |
| Shape         | CLI `shapes create`         | MCP or CLI                    | CLI update / delete                |
| Card          | CLI `cards create`          | MCP or CLI                    | CLI update / delete                |
| Text          | CLI `texts create`          | MCP or CLI                    | CLI update / delete                |
| Image         | CLI `images create-*`       | MCP `image_get_data`          | CLI update / delete                |
| Connector     | CLI `connectors create`     | CLI                           | CLI update / delete                |
| Embed         | CLI `embeds create`         | CLI                           | CLI update / delete                |
| Mind map node | CLI `mind-map-nodes create` | CLI                           | CLI delete                         |

\*Call `diagram_get_dsl` first (once per type per session)
\*\*Two-step: create then update for position/size (see Gotchas)

### Board-Level Operations

| Task                    | Tool                                                                           |
| ----------------------- | ------------------------------------------------------------------------------ |
| Find/list boards        | CLI `boards list --all`                                                        |
| Board metadata          | CLI `boards get --board-id ID`                                                 |
| Explore board structure | MCP `context_explore`                                                          |
| Share board             | CLI `board-members share`                                                      |
| Tags                    | CLI `tags create/attach`                                                       |
| Groups                  | CLI `groups create/un-group`                                                   |
| Webhooks                | CLI `webhooks create/list/delete`                                              |
| Upload image from file  | CLI `images create-image-item-using-local-file --board-id ID --file ./img.png` |
| Upload image from URL   | CLI `images create-image-item-using-url`                                       |
| Upload document file    | CLI `documents create-document-item-using-file-from-device`                    |
| Bulk create items       | CLI `bulk-operations create-items`                                             |
| Screenshot webpage      | agent-browser `open` → `wait 1000` → `screenshot`                              |

### Multi-Tool Chains

| Task                              | Chain                                                                                                |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Screenshot page → upload to board | agent-browser screenshot → miroctl images upload → (sleep 2) → miroctl items update to move to frame |
| Create frame with doc + diagram   | miroctl frames create+update → MCP doc_create with parent_id → MCP diagram_create with parent_id     |
| Read board → implement feature    | MCP context_explore → MCP context_get on relevant items → code changes                               |
| Populate board from data          | miroctl frames create → MCP table_create + table_sync_rows → MCP doc_create                          |

## Board ID Extraction

MCP accepts full Miro URLs — board_id and item_id are auto-extracted.

miroctl needs the board ID extracted from the URL:

```
https://miro.com/app/board/BOARD_ID=/              → BOARD_ID=
https://miro.com/app/board/BOARD_ID=/?moveToWidget=345... → BOARD_ID=
```

Pattern: segment after `/board/` up to `/` or `?`.

```bash
BOARD_ID=$(echo "$URL" | sed 's|.*/board/\([^/?]*\).*|\1|')
```

For miroctl, pass as: `--board-id $BOARD_ID`

## Positioning

Board coordinates: center at `(0, 0)`, positive X right, positive Y down.

**Spacing** to prevent overlap: diagrams 2000–3000 units apart, tables 1500–2000, documents 500–1000.

Use `parent_id` (MCP) or `items update` with `{"parent":{"id":"FRAME_ID"}}` (CLI) to place items inside frames. Coordinates become relative to the frame's top-left corner.

## Error Handling

### Token Expiry (miroctl)

miroctl exits with code 3 on 401/403. On any auth error:

1. Tell user: "Token expired. Get a fresh one from https://developers.miro.com/reference/get-access-token-context and paste it here."
2. Run `miroctl auth set-token <NEW_TOKEN>`
3. **Retry the exact command that failed.**

### MCP Failures

If an MCP tool returns an access or server error, fall back to miroctl:

| MCP failure        | CLI fallback                                                                   |
| ------------------ | ------------------------------------------------------------------------------ |
| `context_explore`  | `miroctl items get-items --board-id ID --limit 50`                             |
| `board_list_items` | `miroctl items get-items-within-frame --board-id ID --parent-item-id FRAME_ID` |
| `doc_get`          | No equivalent — inform user                                                    |
| `table_list_rows`  | No equivalent — inform user                                                    |
| `diagram_create`   | No equivalent — inform user                                                    |

## Gotchas

**Frame creation requires two calls.** `miroctl frames create` only accepts title. Position, size, and style must be set via a follow-up update:

```bash
FRAME_ID=$(miroctl frames create --board-id $BID --data '{"data":{"title":"My Frame"}}' | jq -r '.id')
miroctl frames update --board-id $BID --item-id $FRAME_ID --data '{
  "position":{"x":0,"y":0},
  "geometry":{"width":1600,"height":1200},
  "style":{"fillColor":"#F5F6F8"}
}'
```

**Sleep after image upload.** After `images create-image-item-using-local-file`, wait 2 seconds before moving the item to a frame. The API returns 404 if you call `items update` immediately.

**Always read before editing docs.** MCP `doc_update` uses exact text find-and-replace. Always call `doc_get` first to get the precise text.

**Always get DSL spec before creating diagrams.** Call `diagram_get_dsl` before `diagram_create`. Only needed once per diagram type per session.

**`--all` breaks on cursor-based endpoints.** Endpoints like `items get-items` that use `--cursor` will fail on page 2+ due to cursor double-encoding. Use `--limit` and paginate manually with `--cursor`. Offset-based endpoints like `boards list` work fine with `--all`.

**`items get-items` minimum limit is 10.** The API rejects `--limit` values below 10.

**Mindmap is not available via `diagram_create`.** Only `flowchart`, `uml_class`, `uml_sequence`, `entity_relationship` are supported. Mindmap uses a separate backend API not exposed through MCP tools.

**miroctl output is JSON.** Parse with `jq`. Capture IDs: `| jq -r '.id'`

**Wait after page load for screenshots.** After `agent-browser open <url>`, run `agent-browser wait 1000` before taking a screenshot — pages with animations or transitions need time to settle.

## Tool References

**CRITICAL: When you need tool details, load the quick reference first.** It is a small index with line pointers into the full reference. Read only the specific line range you need from the full reference — never load it entirely.

Quick references (load these):

- **[miroctl-quick.md](reference/miroctl-quick.md)** — command index, CRUD pattern, key gotchas
- **[miro-mcp-quick.md](reference/miro-mcp-quick.md)** — tool index, essential patterns
- **[agent-browser-quick.md](reference/agent-browser-quick.md)** — command index, screenshot pattern

Full references (read by line range from quick ref):

- **[miroctl.md](reference/miroctl.md)** — command patterns, CRUD syntax, file uploads
- **[miro-mcp.md](reference/miro-mcp.md)** — tool signatures, parameters, examples, best practices
- **[agent-browser.md](reference/agent-browser.md)** — navigation, interaction, screenshots
- **[tool-selection.md](reference/tool-selection.md)** — routing rules, fallback chains, overlap resolution

## Testing

To test the skill, follow **[scripts/test-playbook.md](scripts/test-playbook.md)**. Always create a fresh board — never reuse an existing one. **Print the board URL to the user and wait for confirmation before starting tests** — this lets them open the board and watch items appear in real time. Run Part 1 (CLI) via bash, Part 2 (MCP) via MCP tool calls. Clean up the board when done.
