# Miro MCP Tools Reference

All tools accept full Miro board URLs. Board ID and item ID are auto-extracted from URL query parameters (`moveToWidget`, `focusWidget`).

## Contents

- [context_explore](#context_explore) — discover board structure
- [context_get](#context_get) — AI-powered content extraction
- [board_list_items](#board_list_items) — list items with filtering
- [doc_create](#doc_create) — create markdown document
- [doc_get](#doc_get) — read document content
- [doc_update](#doc_update) — edit document (find-and-replace)
- [diagram_get_dsl](#diagram_get_dsl) — get diagram DSL format spec
- [diagram_create](#diagram_create) — create diagram from DSL
- [table_create](#table_create) — create table with columns
- [table_list_rows](#table_list_rows) — read/filter table rows
- [table_sync_rows](#table_sync_rows) — add or update rows
- [image_get_data](#image_get_data) — get image data
- [image_get_url](#image_get_url) — get image download URL

---

## context_explore

Discover high-level items on a board: frames, documents, tables, prototypes, diagrams.

```
context_explore(board_url="https://miro.com/app/board/ID/")
```

Returns list of items with URLs and titles. Use these URLs with `context_get`.

## context_get

Get text content from a specific item. URL must include `moveToWidget` parameter.

```
context_get(item_url="https://miro.com/app/board/ID/?moveToWidget=ITEM_ID")
```

Returns vary by item type:
- **Documents**: Markdown content
- **Frames**: AI-generated summary of contents
- **Tables**: Formatted table data
- **Diagrams**: AI-generated description
- **Prototype screens**: HTML markup
- **Prototype containers**: AI-generated navigation map

## board_list_items

List items with type filtering and pagination. Can scope to a parent frame.

```
board_list_items(
  board_id="ID",
  limit=50,
  item_type="sticky_note",    # optional filter
  item_id="PARENT_FRAME_ID",  # optional: scope to frame (limit capped at 50)
  cursor="next_page_cursor"   # optional: pagination
)
```

**Item types:** `app_card`, `card`, `data_table_format`, `document`, `doc_format`, `embed`, `frame`, `image`, `preview`, `shape`, `sticky_note`, `text`

## doc_create

Create a markdown document on the board.

```
doc_create(
  board_id="ID",
  content="# Title\n\nMarkdown content...",
  parent_id="FRAME_ID",  # optional: place inside frame
  x=100,                  # optional: position
  y=200                   # optional
)
```

**Supported markdown:** headings (h1-h6), **bold**, *italic*, lists (ordered + unordered), [links](url).
**Not supported:** code blocks, tables.

## doc_get

Read document content. Returns markdown and content version.

```
doc_get(board_id="ID", item_id="DOC_ID")
```

**Always call before `doc_update`** to get exact text for matching.

## doc_update

Edit document content via find-and-replace.

```
doc_update(
  board_id="ID",
  item_id="DOC_ID",
  old_content="exact text to find",
  new_content="replacement text",
  replace_all=false       # optional: replace all occurrences
)
```

**Requires exact text match.** Read the document first with `doc_get`.

## diagram_get_dsl

Get DSL format specification for a diagram type. **Must call before `diagram_create`.**

```
diagram_get_dsl(
  board_id="ID",
  diagram_type="flowchart"   # or: uml_class, uml_sequence, entity_relationship
)
```

Returns rules, syntax, color guidelines, and examples. Only needed once per diagram type per session.

**Note:** Only `flowchart`, `uml_class`, `uml_sequence`, and `entity_relationship` are supported. Mindmap uses a separate backend API not exposed through MCP tools.

## diagram_create

Create a diagram from DSL text. Requires prior call to `diagram_get_dsl`.

```
diagram_create(
  board_id="ID",
  diagram_type="flowchart",
  title="User Journey",
  diagram_dsl="<DSL text following the spec>",
  parent_id="FRAME_ID",  # optional: place inside frame
  x=0,                    # optional: position
  y=0                     # optional
)
```

**Diagram types:** `flowchart`, `uml_class`, `uml_sequence`, `entity_relationship`

## table_create

Create a table with typed columns.

```
table_create(
  board_id="ID",
  table_title="Issues",
  columns=[
    {"column_title": "Title", "column_type": "text"},
    {"column_title": "Description", "column_type": "text"},
    {
      "column_title": "Status",
      "column_type": "select",
      "options": [
        {"displayValue": "To Do", "color": "#4287f5"},
        {"displayValue": "In Progress", "color": "#FFA500"},
        {"displayValue": "Done", "color": "#00FF00"}
      ]
    }
  ]
)
```

Max 50 columns. Max 50 options per select column.

## table_list_rows

Read table rows with optional filtering by select column values.

```
table_list_rows(
  board_id="ID",
  item_id="TABLE_ID",
  filter_by='{"Status": ["Open", "In Progress"]}',  # optional, select columns only
  limit=10,
  next_cursor="cursor"   # optional: pagination
)
```

**Do not change `filter_by` when paginating with a cursor.** Start a new pagination sequence for different filters.

## table_sync_rows

Add or update table rows. Use `key_column` to match existing rows for update.

```
table_sync_rows(
  board_id="ID",
  item_id="TABLE_ID",
  key_column="Title",    # optional: column to match for upsert
  rows=[
    {
      "cells": [
        {"columnTitle": "Title", "value": "Build feature X"},
        {"columnTitle": "Status", "value": "In Progress"}
      ]
    }
  ]
)
```

Without `key_column`, all rows are inserted as new. With `key_column`, matching rows are updated.

## image_get_data

Get image data from a board item (base64 encoded).

```
image_get_data(board_id="ID", item_id="IMAGE_ID")
```

## image_get_url

Get download URL for an image item.

```
image_get_url(board_id="ID", item_id="IMAGE_ID")
```

## Board Coordinates

Board coordinates use a Cartesian system with center at `(0, 0)`. Positive X goes right, positive Y goes down.

**Spacing recommendations** to prevent overlap when placing multiple items:

| Content type | Spacing (units apart) |
|-------------|----------------------|
| Diagrams | 2000–3000 |
| Tables | 1500–2000 |
| Documents | 500–1000 |

Use `parent_id` to place items inside frames — coordinates then become relative to the frame's top-left corner.

## Best Practices

### Diagrams
- Be specific about elements and relationships in the DSL
- Specify flow direction when relevant
- Include decision points and conditions for flowcharts
- Always call `diagram_get_dsl` first — follow the returned spec exactly

### Documents
- Structure with clear headings (h1 for title, h2 for sections)
- Keep content focused and scannable
- Use lists for multiple items
- Include links to related resources
- No code blocks or tables in doc content (not supported)

### Tables
- Choose meaningful, concise column names
- Use select columns for status, priority, or category fields
- Define visually distinct colors for select options
- Use `key_column` in `table_sync_rows` for idempotent updates
- Filter with `table_list_rows` before bulk updates to verify data

### Context Extraction
- Start with `context_explore` to discover board contents
- Focus on specific frames when boards are large
- Use `context_get` with item URLs (must include `moveToWidget` parameter)
- For bulk item listing, use `board_list_items` with type filters

## Doc Content Example

A well-structured document for `doc_create`:

```
# Sprint Planning — Week 12

## Goals
- Complete user authentication module
- Fix critical bugs from QA
- Ship onboarding flow v2

## Team Assignments
1. **Alice** — Auth backend
2. **Bob** — Frontend integration
3. **Carol** — Bug fixes

## Key Dates
- *Monday*: Sprint kickoff
- *Wednesday*: Mid-sprint review
- *Friday*: Demo + retro

## Resources
- [Design specs](https://example.com/specs)
- [API documentation](https://example.com/api)
```
