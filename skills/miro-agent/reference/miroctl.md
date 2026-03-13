# miroctl CLI Reference

## Global Options

Available on every command (per `miroctl --help`):

| Flag | Description |
|------|-------------|
| `--profile <PROFILE>` | Config profile to use |
| `--base-url <BASE_URL>` | Override API base URL |
| `--token <TOKEN>` | Access token (overrides stored token) |
| `--format <FORMAT>` | Output format: json, raw, jsonl (default: json) |
| `--all` | Fetch all pages (pagination) — see Pagination section for caveats |
| `-v, --verbose` | Enable verbose output |
| `--retry-unsafe` | Retry non-idempotent requests on failure |

## Common Per-Command Options

Present on most but not all commands:

| Flag | Description |
|------|-------------|
| `--board-id <ID>` | Board ID (required for most commands, not on `boards create`, `boards list`, `auth`, `config`) |
| `--item-id <ID>` | Item ID (for get/update/delete operations) |
| `--data '<json>'` | Request body as JSON string or `@file.json` (for create/update operations) |
| `--file <path>` | File to upload (multipart operations only) |
| `--limit <n>` | Items per page (list commands only) |
| `--cursor <cursor>` | Pagination cursor (cursor-based list commands only) |

**Note:** `--path key=value` syntax is only for `miroctl api call` (the escape hatch). All other commands use named flags like `--board-id`, `--item-id`, etc.

## CRUD Pattern

All item types follow the same structure:

```bash
miroctl <type> create --board-id $BID --data '{ ... }'
miroctl <type> get    --board-id $BID --item-id $ITEM_ID
miroctl <type> update --board-id $BID --item-id $ITEM_ID --data '{ ... }'
miroctl <type> delete --board-id $BID --item-id $ITEM_ID
```

**Capture IDs from create responses:** `| jq -r '.id'`

## Auth

```bash
miroctl auth status                # Check if token is stored
miroctl auth set-token <TOKEN>     # Store token for active profile
miroctl auth revoke                # Revoke and remove token
```

Token resolution order: `--token` flag > `MIRO_ACCESS_TOKEN` env var > stored token.

## Boards

```bash
miroctl boards create --data '{"name":"Sprint 12","description":"Week 12 planning"}'
miroctl boards list --all                    # List all boards (paginated)
miroctl boards get --board-id $BID
miroctl boards update-board --board-id $BID --data '{"name":"New Name"}'
miroctl boards delete --board-id $BID
miroctl boards copy-board --board-id $BID
```

## Items (Generic)

Works across all item types:

```bash
miroctl items get-items --board-id $BID --limit 50
miroctl items get-items-within-frame --board-id $BID --parent-item-id $FRAME_ID
miroctl items get --board-id $BID --item-id $ITEM_ID
miroctl items update --board-id $BID --item-id $ITEM_ID --data '{ ... }'
miroctl items delete-item --board-id $BID --item-id $ITEM_ID
```

**Filter by type:** `miroctl items get-items --board-id $BID --type sticky_note --limit 50`

**Move item to frame:**
```bash
miroctl items update --board-id $BID --item-id $ITEM_ID \
  --data '{"parent":{"id":"FRAME_ID"},"position":{"x":100,"y":100}}'
```

## Frames

**Two-step creation required.** Create only accepts title; position/size/style need a follow-up update.

```bash
# Step 1: Create (title only)
FRAME_ID=$(miroctl frames create --board-id $BID \
  --data '{"data":{"title":"My Frame"}}' | jq -r '.id')

# Step 2: Set position, size, style
miroctl frames update --board-id $BID --item-id $FRAME_ID --data '{
  "position": {"x": 0, "y": 0},
  "geometry": {"width": 1600, "height": 1200},
  "style": {"fillColor": "#F5F6F8"}
}'
```

## Sticky Notes

```bash
miroctl sticky-notes create --board-id $BID --data '{
  "data": {"content": "Hello from miroctl!"},
  "style": {"fillColor": "yellow"},
  "position": {"x": 0, "y": 0}
}'
```

## Cards

```bash
miroctl cards create --board-id $BID --data '{
  "data": {"title": "Task title", "description": "Details here"}
}'
```

## Shapes

```bash
miroctl shapes create --board-id $BID --data '{
  "data": {"content": "Label", "shape": "rectangle"},
  "style": {"fillColor": "#1e1e1e", "fontFamily": "roboto_mono", "fontSize": "12", "textAlign": "left", "color": "#ffffff"},
  "geometry": {"width": 500, "height": 300},
  "position": {"x": 100, "y": 100}
}'
```

Shape types: `rectangle`, `round_rectangle`, `circle`, `triangle`, `rhombus`, `parallelogram`, `trapezoid`, `pentagon`, `hexagon`, `octagon`, `wedge_round_rectangle_callout`, `star`, `flow_chart_*`, etc.

**Note:** `data.content` accepts HTML: `<p style="...">text</p>`.

## Text Items

```bash
miroctl texts create --board-id $BID --data '{
  "data": {"content": "Hello world"},
  "position": {"x": 0, "y": 0}
}'
```

## Images

```bash
# Upload from local file
IMG_ID=$(miroctl images create-image-item-using-local-file \
  --board-id $BID --file ./screenshot.png | jq -r '.id')

# Create from URL
miroctl images create-image-item-using-url --board-id $BID --data '{
  "data": {"url": "https://example.com/image.png"}
}'

# IMPORTANT: sleep 2 seconds before moving uploaded images to a frame
sleep 2
miroctl items update --board-id $BID --item-id $IMG_ID \
  --data '{"parent":{"id":"FRAME_ID"}}'
```

## Connectors

```bash
miroctl connectors create --board-id $BID --data '{
  "startItem": {"id": "ITEM_ID_1"},
  "endItem": {"id": "ITEM_ID_2"},
  "style": {"strokeColor": "#000000"}
}'
```

## Tags

```bash
# Create a tag
TAG_ID=$(miroctl tags create --board-id $BID --data '{"title":"priority","fillColor":"red"}' | jq -r '.id')

# Attach to item
miroctl tags attach --board-id $BID --item-id $ITEM_ID --tag-id $TAG_ID

# Find items by tag
miroctl tags get-items-by-tag --board-id $BID --tag-id $TAG_ID
```

## Groups

```bash
miroctl groups create --board-id $BID --data '{"items":["ITEM_ID_1","ITEM_ID_2"]}'
miroctl groups get-all-groups --board-id $BID
miroctl groups un-group --board-id $BID --group-id $GROUP_ID
```

## Bulk Operations

```bash
# From inline JSON
miroctl bulk-operations create-items --board-id $BID --data '[...]'

# From file
miroctl bulk-operations create-items-in-bulk-using-file-from-device \
  --board-id $BID --file ./items.json
```

## Board Members

```bash
miroctl board-members share --board-id $BID --data '{
  "emails": ["alice@company.com"],
  "role": "commenter"
}'
miroctl board-members list --board-id $BID
```

## Documents (File Upload)

```bash
miroctl documents create-document-item-using-file-from-device \
  --board-id $BID --file ./report.pdf
```

## Embeds

```bash
miroctl embeds create --board-id $BID --data '{
  "data": {"url": "https://example.com"}
}'
```

## API Escape Hatch

Call any Miro API operation by operationId. This is the **only** command that uses `--path key=value`:

```bash
miroctl api call <OPERATION_ID> \
  --path board_id=abc \
  --query limit=5 \
  --data '{"key":"value"}'
```

If you pass an unknown operationId, all available IDs are printed.

## Pagination

**Cursor-based endpoints** (items, connectors, etc.): Use `--limit` with manual `--cursor` pagination. Do **not** use `--all` — it has a cursor double-encoding bug that causes 400 errors on page 2+.

**Offset-based endpoints** (boards list, tags get-items-by-tag): `--all` works correctly.

**Minimum limit:** `items get-items` requires `--limit` >= 10. The API rejects lower values.

```bash
# Cursor-based: manual pagination
miroctl items get-items --board-id $BID --limit 50

# Next page (use cursor from previous response)
miroctl items get-items --board-id $BID --limit 50 --cursor "<cursor_value>"

# Offset-based: --all is safe
miroctl boards list --all
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 2 | CLI usage error |
| 3 | Auth error (401/403) — token missing or expired |
| 4 | Network/timeout error |
| 5 | Server error or unexpected response |
