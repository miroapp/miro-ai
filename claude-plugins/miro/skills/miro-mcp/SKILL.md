---
name: miro-mcp
description: This skill teaches how to use Miro MCP tools effectively for creating diagrams, documents, tables, and extracting context from Miro boards. Use when the user asks about Miro capabilities, wants to create content on Miro boards, or needs to work with Miro board data.
---

# Using Miro with Claude Code

## What is Miro MCP?

Miro MCP (Model Context Protocol) enables Claude to interact directly with Miro boards. Create diagrams, documents, and tables; read board content; and extract structured documentation from visual designs.

## Available Tools

The Miro MCP provides these tool categories:

### Content Creation
- **`miro__draft_diagram_new`** - Generate diagrams from text descriptions
- **`miro__draft_doc_new`** - Create markdown documents on boards
- **`miro__table_create_new`** - Create tables with text and select columns
- **`miro__table_sync_rows`** - Add or update table rows

### Content Reading
- **`miro__board_get_items`** - List items on a board with filtering
- **`miro__context_get_board_docs`** - Extract typed documentation from boards
- **`miro__table_list_rows`** - Read table data with filtering
- **`miro__board_get_image_data`** - Get image content from boards

## Board URLs and IDs

Miro tools accept board URLs directly. Extract board_id and item_id automatically from URLs like:
- `https://miro.com/app/board/uXjVK123abc=/` - Board URL
- `https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345` - URL with item focus

When a URL includes `moveToWidget` or `focusWidget` parameters, the item_id is extracted automatically.

## Creating Diagrams

Use `miro__draft_diagram_new` to create visual diagrams from text descriptions.

### Supported Diagram Types
- **flowchart** - Process flows, workflows, decision trees
- **mindmap** - Hierarchical ideas, brainstorming
- **uml_class** - Class structures, inheritance relationships
- **uml_sequence** - Interactions between components over time
- **entity_relationship** - Database schemas, data models

### Description Formats

Natural language works well:
```
User registration flow: start -> enter email -> validate email ->
send verification -> user confirms -> create account -> redirect to dashboard
```

Mermaid notation for precise control:
```
flowchart TD
    A[Start] --> B{Valid Email?}
    B -->|Yes| C[Send Verification]
    B -->|No| D[Show Error]
    C --> E[Wait for Confirm]
    E --> F[Create Account]
```

### Positioning Diagrams

Use `x` and `y` coordinates to position diagrams on the board. The board center is (0, 0). When creating multiple diagrams, offset positions to prevent overlap:
- First diagram: x=0, y=0
- Second diagram: x=2000, y=0
- Third diagram: x=0, y=1500

### Placing in Frames

Set `parent_id` to a frame ID to place the diagram inside that frame.

## Creating Documents

Use `miro__draft_doc_new` to create Google Docs-style documents on boards.

### Supported Markdown
- Headings: `# H1`, `## H2`, through `###### H6`
- Bold: `**text**`
- Italic: `*text*`
- Unordered lists: `- item`
- Ordered lists: `1. item`
- Links: `[text](url)`

### Not Supported
- Code blocks
- Tables (use `miro__table_create_new` instead)
- Images

### Example Document

```markdown
# Sprint Planning - Week 12

## Goals
- Complete user authentication module
- Fix critical bugs from QA

## Team Assignments
1. **Alice** - Auth backend
2. **Bob** - Frontend integration
3. **Carol** - Bug fixes

## Resources
- [Design specs](https://example.com/specs)
- [API documentation](https://example.com/api)
```

## Working with Tables

### Creating Tables

Use `miro__table_create_new` to create tables with typed columns.

**Column Types:**
- **text** - Free-form text entry
- **select** - Dropdown with predefined options (requires color for each option)

Example column configuration:
```json
[
  {"type": "text", "title": "Task"},
  {"type": "text", "title": "Assignee"},
  {
    "type": "select",
    "title": "Status",
    "options": [
      {"displayValue": "To Do", "color": "#E0E0E0"},
      {"displayValue": "In Progress", "color": "#FFD700"},
      {"displayValue": "Done", "color": "#00FF00"}
    ]
  },
  {
    "type": "select",
    "title": "Priority",
    "options": [
      {"displayValue": "Low", "color": "#90EE90"},
      {"displayValue": "Medium", "color": "#FFA500"},
      {"displayValue": "High", "color": "#FF6347"}
    ]
  }
]
```

### Adding/Updating Rows

Use `miro__table_sync_rows` to add or update table data.

Set `key_column` to match existing rows for updates. Without it, all rows are inserted as new.

```json
{
  "key_column": "Task",
  "rows": [
    {
      "cells": [
        {"columnTitle": "Task", "value": "Implement login"},
        {"columnTitle": "Status", "value": "In Progress"},
        {"columnTitle": "Assignee", "value": "Alice"}
      ]
    }
  ]
}
```

### Reading Table Data

Use `miro__table_list_rows` to read table contents. Filter by column value:
```
filter_by: "Status=In Progress"
```

## Extracting Board Documentation

Use `miro__context_get_board_docs` to generate structured documentation from board content.

### Document Types

| Type | Description |
|------|-------------|
| `project_summary` | High-level overview, recommended starting point |
| `style_guide` | Design tokens, colors, typography |
| `screen_design_requirements` | UI/UX specifications per screen |
| `screen_functional_requirements` | Feature requirements per screen |
| `general_board_document` | Generic board content extraction |
| `technical_specification` | Technical implementation details |
| `functional_requirements` | Business requirements |
| `non_functional_requirements` | Performance, security, scalability |
| `prototypes` | Interactive prototype HTML/CSS |

### Workflow

1. Start with `project_summary` to understand board structure
2. Based on recommendations, request specific document types
3. Filter to specific frames using `item_id` parameter

## Browsing Board Items

Use `miro__board_get_items` to explore board contents.

### Filtering by Type
- `frame` - Frames/containers
- `sticky_note` - Sticky notes
- `card` - Card widgets
- `shape` - Shapes
- `text` - Text elements
- `image` - Images
- `document` - Documents

### Filtering by Container

Set `item_id` to a frame ID to list only items within that frame.

### Pagination

Use `cursor` from previous response to fetch next page. Default limit is capped at 50 when filtering by item_id.

## Best Practices

### For Diagrams
- Be specific about elements and relationships
- Specify flow direction (top-down, left-right)
- Include decision points and conditions
- Let AI auto-detect diagram type or specify explicitly

### For Documents
- Structure with clear headings
- Keep content focused and scannable
- Use lists for multiple items
- Include links to related resources

### For Tables
- Choose meaningful column names
- Use select columns for status/priority fields
- Define clear, distinct option colors
- Use key_column for idempotent updates

### For Context Extraction
- Start with project_summary
- Focus on specific frames when boards are large
- Request multiple document types for comprehensive coverage

## Quick Reference

| Task | Tool | Key Parameters |
|------|------|----------------|
| Create flowchart | `draft_diagram_new` | board_id, text_description, diagram_type="flowchart" |
| Create document | `draft_doc_new` | board_id, content (markdown) |
| Create table | `table_create_new` | board_id, title, columns |
| Add table rows | `table_sync_rows` | board_id, item_id, rows, key_column |
| Get board summary | `context_get_board_docs` | board_id, document_types=["project_summary"] |
| List frames | `board_get_items` | board_id, item_type="frame" |

See [tools-reference.md](references/tools-reference.md) for complete parameter documentation.
