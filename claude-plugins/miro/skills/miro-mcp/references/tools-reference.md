# Miro MCP Tools Reference

Complete parameter documentation for all Miro MCP tools.

## Common Parameters

### board_id
All tools accept `board_id` which can be:
- **Board ID only:** `uXjVK123abc=`
- **Full board URL:** `https://miro.com/app/board/uXjVK123abc=/`
- **URL with widget focus:** `https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345`

When URL includes `moveToWidget` or `focusWidget` query parameters, the `item_id` is auto-extracted if not explicitly provided.

### item_id
Identifies a specific item on the board (frame, table, image, etc.). Can be:
- Item ID: `3458764612345`
- Auto-extracted from board URL's `moveToWidget` or `focusWidget` parameters

---

## Content Creation Tools

### miro__diagram_create

Create diagrams from text descriptions.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| text_description | string | Yes | Diagram description (natural language or Mermaid/PlantUML) |
| diagram_type | string | No | `flowchart`, `mindmap`, `uml_class`, `uml_sequence`, `entity_relationship` |
| x | number | No | X-axis position (center = 0) |
| y | number | No | Y-axis position (center = 0) |
| parent_id | string | No | Frame ID to place diagram inside |

**Diagram Types:**

| Type | Use Case | Example Description |
|------|----------|---------------------|
| `flowchart` | Processes, workflows, decisions | "Login flow: enter credentials -> validate -> success or retry" |
| `mindmap` | Brainstorming, hierarchies | "Project structure: Frontend (React, Components), Backend (API, Database)" |
| `uml_class` | Class diagrams, OOP design | "User class with name, email; Admin extends User with permissions" |
| `uml_sequence` | Interactions over time | "Client sends request to Server, Server queries Database, returns response" |
| `entity_relationship` | Database schemas | "Users table with id, name; Orders table with user_id foreign key" |

---

### miro__doc_create

Create markdown documents on boards.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| content | string | No | Markdown content |
| x | number | No | X-axis position |
| y | number | No | Y-axis position |
| parent_id | string | No | Frame ID to place document inside |

**Supported Markdown:**
- `# Heading 1` through `###### Heading 6`
- `**bold**` and `*italic*`
- `- unordered list` and `1. ordered list`
- `[link text](url)`

**Not Supported:**
- Code blocks (``` or indented)
- Tables
- Images
- Horizontal rules

---

### miro__table_create

Create tables with typed columns.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| title | string | Yes | Table name (max 255 chars) |
| columns | array | Yes | Column definitions (1-50 columns) |

**Column Types:**

**Text Column:**
```json
{
  "type": "text",
  "title": "Column Name"
}
```

**Select Column:**
```json
{
  "type": "select",
  "title": "Status",
  "options": [
    {"displayValue": "To Do", "color": "#E0E0E0"},
    {"displayValue": "In Progress", "color": "#FFD700"},
    {"displayValue": "Done", "color": "#00FF00"}
  ]
}
```

Color must be hex format: `#RRGGBB`

---

### miro__table_sync_rows

Add or update table rows.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| item_id | string | No | Table ID (auto-extracted from URL if present) |
| rows | array | Yes | Row data to add/update |
| key_column | string | No | Column name for matching existing rows |

**Row Format:**
```json
{
  "cells": [
    {"columnTitle": "Task", "value": "Task name"},
    {"columnTitle": "Status", "value": "In Progress"},
    {"columnTitle": "Tags", "value": ["tag1", "tag2"]}
  ]
}
```

- For text columns: string value
- For select columns: displayValue string or array of displayValue strings
- With `key_column`: matching rows are updated; non-matching rows are inserted
- Without `key_column`: all rows are inserted as new

---

## Content Reading Tools

### miro__board_list_items

List items on a board with pagination.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| limit | integer | Yes | Items per page (10-1000, capped at 50 with item_id) |
| item_id | string | No | Parent container ID to filter items |
| item_type | string | No | Filter by item type |
| cursor | string | No | Pagination cursor from previous response |

**Item Types:**
- `app_card` - App cards
- `card` - Card widgets
- `data_table_format` - Data tables
- `document` - Documents
- `doc_format` - Doc format items
- `embed` - Embedded content
- `frame` - Frames
- `image` - Images
- `preview` - Previews
- `shape` - Shapes
- `sticky_note` - Sticky notes
- `text` - Text elements

---

### miro__context_get

Get text context from a specific item on a Miro board.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| item_url | string | Yes | Miro board URL with `moveToWidget` parameter identifying the item |

**Returns by Item Type:**

| Item Type | Returns |
|-----------|---------|
| Documents | HTML markup of the document content |
| Prototype screens | HTML markup representing the UI/layout |
| Prototype containers | AI-generated map of all screens with navigation flow |
| Frames | AI-generated summary of frame contents |
| Tables | Formatted table data |
| Diagrams | AI-generated description and analysis |

**Example URL:**
`https://miro.com/app/board/uXjVGeTCXKY=/?moveToWidget=3458764654510025479`

---

### miro__table_list_rows

Read table data with filtering and pagination.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| item_id | string | No | Table ID |
| limit | integer | No | Max rows to return (min 1) |
| filter_by | string | No | Filter by column value (e.g., "Status=In Progress") |
| next_cursor | string | No | Pagination cursor |

**Filtering:**
- Case-insensitive matching
- Only select columns supported for filtering
- Format: `"ColumnName=DisplayValue"`

**Important:** Do not change `filter_by` when using a cursor from previous response.

---

### miro__image_get_url

Get download URL for an image item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| item_id | string | No | Image item ID |

---

### miro__image_get_data

Get image data (base64 or visual) for an image item.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| board_id | string | Yes | Board ID or URL |
| item_id | string | No | Image item ID |

---

## Positioning Guide

Board coordinates use Cartesian system:
- Center of board: `(0, 0)`
- Positive X: right
- Positive Y: down

**Spacing Recommendations:**
- Diagrams: 2000-3000 units apart
- Documents: 500-1000 units apart
- Tables: 1500-2000 units apart

**Example Multi-Diagram Layout:**
```
Diagram 1: x=0, y=0
Diagram 2: x=2500, y=0
Diagram 3: x=0, y=2000
Diagram 4: x=2500, y=2000
```

---

## Color Reference

Common hex colors for select column options:

| Color | Hex | Use Case |
|-------|-----|----------|
| Gray | #E0E0E0 | Not started, backlog |
| Yellow | #FFD700 | In progress, warning |
| Green | #00FF00 | Done, success |
| Red | #FF6347 | Blocked, high priority |
| Orange | #FFA500 | Medium priority |
| Light Green | #90EE90 | Low priority |
| Blue | #4169E1 | Info, selected |
| Purple | #9370DB | Review, special |

---

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| Board not found | Invalid board_id | Verify URL or ID is correct |
| Item not found | Invalid item_id | List items first to get valid IDs |
| Column not found | Wrong column title in sync_rows | Match exact column titles from table schema |
| Invalid option | Select value doesn't match options | Use exact displayValue from column definition |
| Pagination error | Changed filter_by with cursor | Start new pagination without cursor when changing filters |
