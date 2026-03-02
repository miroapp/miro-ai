# Miro MCP — Quick Reference

Full reference: [reference/miro-mcp.md](miro-mcp.md)

## Tool Index

| Tool | Purpose | Full ref lines |
|------|---------|---------------|
| context_explore | Discover board structure (frames, docs, tables, diagrams) | 23-31 |
| context_get | AI-powered content extraction from specific items | 33-47 |
| board_list_items | List/filter items, scope to frame | 49-63 |
| doc_create | Create markdown document on board | 65-80 |
| doc_get | Read document content + version | 82-90 |
| doc_update | Edit document via find-and-replace | 92-106 |
| diagram_get_dsl | Get DSL format spec (call before diagram_create) | 108-121 |
| diagram_create | Create diagram from DSL text | 123-139 |
| table_create | Create table with text/select columns | 141-165 |
| table_list_rows | Read/filter table rows | 167-181 |
| table_sync_rows | Add or update table rows (upsert) | 183-203 |
| image_get_data | Get image content (base64) | 205-211 |
| image_get_url | Get image download URL | 213-219 |

## Essential Patterns

- All tools accept full Miro board URLs — board_id and item_id auto-extracted from `moveToWidget`/`focusWidget` params
- Always call `doc_get` before `doc_update` (exact text match required)
- Always call `diagram_get_dsl` before `diagram_create` (once per type per session)
- Diagram types: `flowchart`, `uml_class`, `uml_sequence`, `entity_relationship` — no mindmap
- Coordinates: center (0,0), +X right, +Y down
- Spacing: diagrams 2000–3000, tables 1500–2000, docs 500–1000 apart
- Use `parent_id` to place items inside frames
- Use `key_column` in `table_sync_rows` for idempotent upserts
