# miro-agent Test Playbook

Run this playbook to validate the skill end-to-end. Creates a fresh board, tests CLI and MCP operations, then cleans up.

---

## Setup

**Always create a fresh board for testing. Never reuse an existing board.**

```bash
BOARD_ID=$(miroctl boards create --data '{"name":"skill-test-'$(date +%s)'"}' | jq -r '.id')
```

Print the board URL and continue immediately — do not wait for user confirmation:

```
Test board created: https://miro.com/app/board/$BOARD_ID
```

Run preflight:

```bash
bash scripts/preflight.sh
```

Verify MCP with `board_list_items` (the ONLY valid MCP test — do NOT use `context_explore`):

```
board_list_items(board_id="https://miro.com/app/board/$BOARD_ID", limit=10)
```

If this fails with "Board access denied": **STOP** — OAuth token lacks required scopes. User must remove and re-add the MCP server to re-authorize.

---

## Part 1: CLI Tests

Run these commands sequentially. Each should exit 0 and return valid JSON unless noted.

**Important:** Always use the `$BOARD_ID` variable — never inline literal board IDs. Board IDs end with `=` which gets dropped without proper quoting. All commands below use `"$BOARD_ID"` (double-quoted) which handles this correctly.

### 1.1 Frame (two-step creation)

```bash
FRAME_ID=$(miroctl frames create --board-id "$BOARD_ID" \
  --data '{"data":{"title":"Test Frame"}}' | jq -r '.id')

miroctl frames update --board-id "$BOARD_ID" --item-id $FRAME_ID --data '{
  "position":{"x":0,"y":0},
  "geometry":{"width":1600,"height":1200},
  "style":{"fillColor":"#F5F6F8"}
}'
```

**Verify:** Response has `.geometry.width` = 1600, `.position.x` = 0.

### 1.2 Sticky note

```bash
STICKY_ID=$(miroctl sticky-notes create --board-id "$BOARD_ID" --data '{
  "data":{"content":"Test Sticky"},
  "style":{"fillColor":"yellow"},
  "position":{"x":20,"y":100}
}' | jq -r '.id')
```

**Verify:** `.type` = `sticky_note`, `.data.content` = "Test Sticky".

### 1.3 Shape

```bash
SHAPE_COLOR=$(printf '#%06X' $((RANDOM * RANDOM % 16777216)))

SHAPE_ID=$(miroctl shapes create --board-id "$BOARD_ID" --data "{
  \"data\":{\"content\":\"Test Shape\",\"shape\":\"rectangle\"},
  \"style\":{\"fillColor\":\"$SHAPE_COLOR\"},
  \"geometry\":{\"width\":200,\"height\":100},
  \"position\":{\"x\":300,\"y\":50}
}" | jq -r '.id')
```

**Verify:** `.data.shape` = `rectangle`.

### 1.4 Text

```bash
TEXT_ID=$(miroctl texts create --board-id "$BOARD_ID" --data '{
  "data":{"content":"Test Text"},
  "position":{"x":500,"y":90}
}' | jq -r '.id')
```

### 1.5 Card

```bash
CARD_ID=$(miroctl cards create --board-id "$BOARD_ID" --data '{
  "data":{"title":"Test Card"}
}' | jq -r '.id')
```

### 1.6 Connector

```bash
# Note: --data uses double quotes for variable expansion. Keep --board-id
# as a separate quoted arg — do not inline the board ID into the JSON string.
miroctl connectors create --board-id "$BOARD_ID" --data "{
  \"startItem\":{\"id\":\"$STICKY_ID\"},
  \"endItem\":{\"id\":\"$SHAPE_ID\"}
}"
miroctl connectors create --board-id "$BOARD_ID" --data "{
  \"startItem\":{\"id\":\"$STICKY_ID\"},
  \"endItem\":{\"id\":\"$TEXT_ID\"}
}"
```

**Verify:** `.startItem.id` = STICKY_ID, `.endItem.id` = SHAPE_ID.

### 1.7 Tag + attach

```bash
TAG_ID=$(miroctl tags create --board-id "$BOARD_ID" \
  --data '{"title":"test-tag","fillColor":"red"}' | jq -r '.id')

miroctl tags attach --board-id "$BOARD_ID" --item-id $STICKY_ID --tag-id $TAG_ID
```

**Verify:** Both commands exit 0.

### 1.8 Image upload

```bash
# Generate a valid 128x128 red PNG
python3 -c "
import struct, zlib
w=h=128; raw=b''.join(b'\x00'+b'\xff\x00\x00\xff'*w for _ in range(h))
def c(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
open('/tmp/miro-test.png','wb').write(b'\x89PNG\r\n\x1a\n'+c(b'IHDR',struct.pack('>IIBBBBB',w,h,8,6,0,0,0))+c(b'IDAT',zlib.compress(raw))+c(b'IEND',b''))
"

IMG_ID=$(miroctl images create-image-item-using-local-file \
  --board-id "$BOARD_ID" --file /tmp/miro-test.png | jq -r '.id')
```

**Verify:** `.type` = `image`, `.id` is captured.

### 1.9 Embed

```bash
EMBED_ID=$(miroctl embeds create --board-id "$BOARD_ID" --data '{
  "data":{"url":"https://info.cern.ch/hypertext/WWW/TheProject.html"},
  "position":{"x":700,"y":100}
}' | jq -r '.id')
```

**Verify:** `.type` = `embed`, `.data.url` contains info.cern.ch.

### 1.10 Screenshot + upload

```bash
agent-browser set viewport 1400 900
agent-browser open "https://miro.com"
agent-browser screenshot /tmp/miro-screenshot.png

SCREENSHOT_ID=$(miroctl images create-image-item-using-local-file \
  --board-id "$BOARD_ID" --file /tmp/miro-screenshot.png | jq -r '.id')
```

**Verify:** Screenshot file exists, upload returns `.type` = `image`.

### 1.11 Image from URL

```bash
URL_IMG_ID=$(miroctl images create-image-item-using-url --board-id "$BOARD_ID" --data '{
  "data":{"url":"https://picsum.photos/400"},
  "position":{"x":700,"y":200}
}' | jq -r '.id')
```

**Verify:** `.type` = `image`.

### 1.12 Document file upload

```bash
printf '%%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n190\n%%%%EOF' > /tmp/miro-test.pdf

DOC_FILE_ID=$(miroctl documents create-document-item-using-file-from-device \
  --board-id "$BOARD_ID" --file /tmp/miro-test.pdf | jq -r '.id')
```

**Verify:** `.type` = `document`.

### 1.13 Item delete

```bash
miroctl items delete-item --board-id "$BOARD_ID" --item-id $TEXT_ID
```

**Verify:** Exit code 0. Confirm by fetching the item — should return 404.

### 1.14 List items

```bash
miroctl items get-items --board-id "$BOARD_ID" --limit 10
```

**Verify:** `.data` array contains items.

### 1.15 Filter by type

```bash
miroctl items get-items --board-id "$BOARD_ID" --limit 10 --type sticky_note
```

**Verify:** All items in `.data` have `.type` = `sticky_note`.

### 1.16 Get specific item

```bash
miroctl items get --board-id "$BOARD_ID" --item-id $STICKY_ID
```

**Verify:** `.id` = STICKY_ID.

### 1.17 Boards list (offset-based --all)

```bash
miroctl boards list --all
```

**Verify:** Exit code 0. This confirms `--all` works on offset-based endpoints.

### 1.18 Minimum limit validation

```bash
miroctl items get-items --board-id "$BOARD_ID" --limit 10
```

**Verify:** Should **fail** with exit code 5 (400 error, minimum limit is 10).

---

## Part 2: MCP Tests

Run these MCP tool calls against the same test board. Use the board URL: `https://miro.com/app/board/$BOARD_ID`

### 2.1 context_explore

```
context_explore(board_url="https://miro.com/app/board/$BOARD_ID")
```

**Verify:** Returns list including the "Test Frame" frame.

### 2.2 context_get

```
context_get(item_url="https://miro.com/app/board/$BOARD_ID/?moveToWidget=$FRAME_ID")
```

**Verify:** Returns AI summary mentioning the items inside the frame.

### 2.3 board_list_items (filtered)

```
board_list_items(board_id="$BOARD_ID", limit=10, item_type="sticky_note")
```

**Verify:** Returns only sticky notes.

### 2.4 doc_create

```
doc_create(
  board_id="$BOARD_ID",
  content="# Test Document\n\nThis is a **test** document.\n\n- Item one\n- Item two"
)
```

**Verify:** Returns item with document content. Note the item ID for steps 2.5-2.6.

### 2.5 doc_get

```
doc_get(board_id="$BOARD_ID", item_id="$DOC_ID")
```

**Verify:** Returns markdown content matching what was created.

### 2.6 doc_update

```
doc_update(
  board_id="$BOARD_ID",
  item_id="$DOC_ID",
  old_content="Item one",
  new_content="Updated item"
)
```

**Verify:** Success. Call `doc_get` again to confirm the change.

### 2.7 diagram_get_dsl

```
diagram_get_dsl(board_id="$BOARD_ID", diagram_type="flowchart")
```

**Verify:** Returns DSL specification with rules, syntax, color guidelines, example.

### 2.8 diagram_create

```
diagram_create(
  board_id="$BOARD_ID",
  diagram_type="flowchart",
  title="Test Diagram",
  diagram_dsl="<valid DSL from step 2.7>"
)
```

**Verify:** Returns created diagram item.

### 2.9 table_create

```
table_create(
  board_id="$BOARD_ID",
  table_title="Test Table",
  columns=[
    {"column_title": "Title", "column_type": "text"},
    {"column_title": "Status", "column_type": "select", "options": [
      {"displayValue": "Open", "color": "#4287f5"},
      {"displayValue": "Done", "color": "#00FF00"}
    ]}
  ]
)
```

**Verify:** Returns table item. Note the item ID.

### 2.10 table_sync_rows

```
table_sync_rows(
  board_id="$BOARD_ID",
  item_id="$TABLE_ID",
  rows=[{"cells": [
    {"columnTitle": "Title", "value": "Test Row"},
    {"columnTitle": "Status", "value": "Open"}
  ]}]
)
```

**Verify:** Row added successfully.

### 2.11 table_list_rows

```
table_list_rows(
  board_id="$BOARD_ID",
  item_id="$TABLE_ID",
  filter_by='{"Status": ["Open"]}',
  limit=10
)
```

**Verify:** Returns the row from step 2.10.

### 2.12 image_get_data

```
image_get_data(board_id="$BOARD_ID", item_id="$IMG_ID")
```

**Verify:** Returns image data (the test PNG from Part 1).

### 2.13 image_get_url

```
image_get_url(board_id="$BOARD_ID", item_id="$IMG_ID")
```

**Verify:** Returns a download URL.

---

## Cleanup

```bash
miroctl boards delete --board-id "$BOARD_ID"
rm -f /tmp/miro-test.png /tmp/miro-screenshot.png /tmp/miro-test.pdf
```

Print the message below, then a short summary of test results.

```
Test board deleted!
```

---

## What to Watch For

- **Tool routing:** MCP for docs/diagrams/tables/context. CLI for frames/shapes/stickies/images. Agent should never mix these up.
- **Quick ref usage:** Agent should load quick reference first, then read specific line ranges from full reference — not the entire full reference.
- **Frame two-step:** Create then update with position/size/style.
- **Sleep after upload:** 2 seconds before moving images to a frame.
- **Board ID quoting:** Always quote `--board-id "$BOARD_ID"` — the trailing `=` in board IDs gets dropped by some shells without quotes.
- **Board ID handling:** Full URLs to MCP tools. Extracted IDs to miroctl `--board-id`.
- **`--all` caveat:** Works on `boards list` (offset). Breaks on `items get-items` (cursor).
- **Minimum limit:** `items get-items` requires `--limit` >= 10.
- **Fallback:** If MCP fails, agent should try CLI where possible and inform user otherwise.
