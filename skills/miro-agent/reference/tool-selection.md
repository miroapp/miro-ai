# Tool Selection Details

## Core Principle

- **MCP** for content intelligence — anything that benefits from structured input/output or AI understanding
- **miroctl** for API operations — anything MCP can't do, plus fallback when MCP fails
- **agent-browser** for visual capture — screenshots, web interaction, DOM inspection

## Overlap Resolution

Several operations can be done with either MCP or CLI. Use these rules:

### Reading Board Items

| Approach | Returns | When to use |
|----------|---------|-------------|
| MCP `context_explore` | Frames, docs, tables, diagrams with URLs and titles | First exploration of a board — understand what's there |
| MCP `context_get` | AI summaries (frames), markdown (docs), HTML (prototypes), formatted data (tables) | Need to understand content semantically |
| MCP `board_list_items` | Structured item list with type filtering | Need items of a specific type, or items within a frame |
| CLI `items get-items --board-id ID --limit 50` | Raw JSON with all fields (position, geometry, style, metadata) | Need exact coordinates, styles, or metadata MCP doesn't expose |
| CLI `items get-items-within-frame --board-id ID --parent-item-id FRAME_ID` | Raw JSON of items inside a frame | Same as above, scoped to a frame |

**Default: MCP first.** It gives more useful context. Fall back to CLI when you need raw field data or MCP is unavailable.

### Reading Documents

MCP `doc_get` returns markdown content. CLI `items get` returns only metadata (type, position, dimensions) — not the document text. **Always use MCP for reading documents.**

### Creating Content on a Board

| Content type | Only option | Notes |
|-------------|-------------|-------|
| Documents | MCP `doc_create` | Accepts markdown, supports `parent_id` for frame placement |
| Diagrams | MCP `diagram_get_dsl` + `diagram_create` | No CLI equivalent |
| Tables | MCP `table_create` + `table_sync_rows` | No CLI equivalent |
| Frames | CLI `frames create` + `frames update` | MCP cannot create frames |
| Shapes | CLI `shapes create` | MCP cannot create shapes |
| Sticky notes | CLI `sticky-notes create` | MCP cannot create sticky notes |
| Text items | CLI `texts create` | MCP cannot create text items |
| Cards | CLI `cards create` | MCP cannot create cards |
| Images | CLI `images create-image-item-using-local-file` | MCP can only read images |
| Connectors | CLI `connectors create` | MCP cannot create connectors |

There is no overlap for creation — each content type has exactly one tool that can create it.

## Fallback Chains

When MCP fails, fall back to CLI where possible:

```
MCP context_explore fails
  → CLI: miroctl items get-items --board-id ID --limit 50
    Parse JSON to find frames, docs, tables by type field

MCP board_list_items fails
  → CLI: miroctl items get-items --board-id ID --limit 50
    Or for frame scope: miroctl items get-items-within-frame --board-id ID --parent-item-id FRAME_ID

MCP doc_get fails
  → No CLI equivalent for document content. Inform user.

MCP doc_create fails
  → No CLI equivalent for structured docs. Inform user.

MCP table_create / table_list_rows / table_sync_rows fails
  → No CLI equivalent. Inform user.

MCP diagram_create fails
  → No CLI equivalent. Inform user.

MCP image_get_data fails
  → CLI: miroctl images get --board-id ID --item-id ITEM_ID
    Returns metadata only, not image data. Limited fallback.
```

**Rule:** If MCP fails for a read operation, try CLI. If MCP fails for a create operation that has no CLI equivalent, inform the user that MCP access is required.

## Multi-Tool Chain Patterns

### Screenshot → Board

Capture a webpage and place it on a board:

```
1. agent-browser open <url>
2. agent-browser wait 1000
3. agent-browser screenshot /tmp/capture.png
4. IMG_ID=$(miroctl images create-image-item-using-local-file --board-id $BID --file /tmp/capture.png | jq -r '.id')
5. sleep 2    # API needs time before item can be moved
6. miroctl items update --board-id $BID --item-id $IMG_ID --data '{"parent":{"id":"FRAME_ID"}}'
```

### Frame with Mixed Content

Create a frame and populate it with different content types:

```
1. FRAME_ID=$(miroctl frames create --board-id $BID --data '{"data":{"title":"My Frame"}}' | jq -r '.id')
2. miroctl frames update --board-id $BID --item-id $FRAME_ID --data '{"position":{"x":0,"y":0},"geometry":{"width":1600,"height":1200},"style":{"fillColor":"#F5F6F8"}}'
3. MCP doc_create with parent_id=$FRAME_ID    # doc goes inside frame
4. MCP diagram_create with parent_id=$FRAME_ID  # diagram goes inside frame
5. Upload image via CLI, sleep 2, then items update with parent
```

MCP items accept `parent_id` directly. CLI items must be created first, then moved with `items update`.

### Board Population from External Data

Read external data and populate a board:

```
1. miroctl frames create + update    # create container frame
2. MCP table_create                  # create table structure
3. MCP table_sync_rows               # populate rows
4. MCP doc_create                    # add summary document
5. MCP diagram_create                # add architectural diagram
```

### Board → Code Implementation

Read board content and use it to drive code changes:

```
1. MCP context_explore               # discover board structure
2. MCP context_get on relevant items  # read content in detail
3. MCP board_list_items with filters  # get specific items (e.g., stickies in a frame)
4. Use extracted content to write code
5. Post results back to board (screenshot, doc, table update)
```
