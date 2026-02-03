# MCP Tools Reference

Overview of available Miro MCP tools. For complete parameter documentation, see [developers.miro.com](https://developers.miro.com/docs/miro-mcp-prompts).

## Content Creation

### miro__diagram_get_dsl

Get the DSL format specification for a diagram type before creating diagrams.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `diagram_type` (required) - `flowchart`, `uml_class`, `uml_sequence`, `entity_relationship`

### miro__diagram_create

Create a diagram from DSL text.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `diagram_dsl` (required) - DSL text following the spec
- `diagram_type` (required) - Type matching the DSL spec
- `x`, `y` (optional) - Position on board
- `parent_id` (optional) - Frame ID to place diagram in

### miro__doc_create

Create a markdown document on a board.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `content` (optional) - Markdown content
- `x`, `y` (optional) - Position on board
- `parent_id` (optional) - Frame ID

**Supported Markdown:**
- Headings (`#` through `######`)
- Bold (`**text**`), Italic (`*text*`)
- Lists (ordered and unordered)
- Links (`[text](url)`)

### miro__table_create

Create a table with typed columns.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `title` (required) - Table name
- `columns` (required) - Array of column definitions

**Column Types:**
- `text` - Free-form text
- `select` - Dropdown with options (requires `displayValue` and `color`)

### miro__table_sync_rows

Add or update table rows.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `item_id` (optional) - Table ID
- `rows` (required) - Array of row data
- `key_column` (optional) - Column for matching existing rows

## Content Reading

### miro__board_list_items

List items on a board with filtering.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `limit` (required) - Max items (10-1000)
- `item_type` (optional) - Filter by type
- `item_id` (optional) - Filter to items in container
- `cursor` (optional) - Pagination cursor

**Item Types:**
`app_card`, `card`, `document`, `doc_format`, `embed`, `frame`, `image`, `preview`, `shape`, `sticky_note`, `text`

### miro__context_explore

List high-level items (frames, documents, prototypes, tables, diagrams).

**Parameters:**
- `board_url` (required) - Full board URL

### miro__context_get

Get text context from a specific item.

**Parameters:**
- `item_url` (required) - URL with `moveToWidget` parameter

**Returns by Item Type:**
- Documents: HTML markup
- Prototype screens: UI/layout HTML
- Frames: AI-generated summary
- Tables: Formatted data
- Diagrams: AI-generated description

### miro__table_list_rows

Read table rows with filtering.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `item_id` (optional) - Table ID
- `filter_by` (optional) - Column filter (e.g., `Status=In Progress`)
- `limit` (optional) - Max rows
- `next_cursor` (optional) - Pagination

### miro__image_get_data

Get image content from a board.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `item_id` (optional) - Image item ID

### miro__image_get_url

Get download URL for an image item.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `item_id` (optional) - Image item ID

## Document Editing

### miro__doc_get

Read document content and version.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `item_id` (optional) - Document ID

### miro__doc_update

Edit document using find-and-replace.

**Parameters:**
- `board_id` (required) - Board ID or URL
- `item_id` (optional) - Document ID
- `old_content` (optional) - Text to find
- `new_content` (optional) - Replacement text
- `replace_all` (optional) - Replace all occurrences

## Board URLs

Tools accept full board URLs:
- `https://miro.com/app/board/uXjVK123abc=/`
- `https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345`

When URLs include `moveToWidget` or `focusWidget` parameters, the item ID is extracted automatically.

## Quick Reference

| Task | Tool |
|------|------|
| Create flowchart | `diagram_create` |
| Create document | `doc_create` |
| Create table | `table_create` |
| Add table rows | `table_sync_rows` |
| List frames | `board_list_items` (item_type=frame) |
| Get board overview | `context_explore` |
| Extract documentation | `context_get` |

## Full Documentation

For complete parameter schemas and examples, see:
- [Miro MCP Tools & Prompts](https://developers.miro.com/docs/miro-mcp-prompts)
- [Miro MCP Overview](https://developers.miro.com/docs/miro-mcp)
