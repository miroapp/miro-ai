---
name: miro-browse
description: >-
  Use when the user wants to list, explore, or filter items on a Miro board
  (frames, sticky notes, cards, shapes, text, images, documents, embeds), or
  wants to discover what's on a board before diving in.
---

# Browse Miro Board Contents

List and explore items on a Miro board with optional filtering.

## Inputs

Identify from the user's request:
1. **board-url** (required): Miro board URL
2. **item-type** (optional): Type of items to filter

## Item Types

- `frame` - Frames/containers
- `sticky_note` - Sticky notes
- `card` - Card widgets
- `shape` - Shapes
- `text` - Text elements
- `image` - Images
- `document` - Documents
- `embed` - Embedded content

## Workflow

1. If board URL is missing, ask the user for it
2. Call `board_list_items` with the board URL, requesting up to 50 items. Apply type filter if the user specified one. If the URL contains a moveToWidget parameter, scope to that container.
3. Present the items in a readable format:
   - Show item type, ID, and relevant content/title
   - Group by type if showing mixed items
4. If there are more items (cursor returned), offer to load more
5. Offer follow-up actions:
   - Focus on a specific frame
   - Filter by a different type
   - Get details about a specific item

## Examples

**User input:** `list items on https://miro.com/app/board/abc=`

**Action:** List all items on the board (first page).

---

**User input:** `show me frames on https://miro.com/app/board/abc=`

**Action:** List only frames on the board.

---

**User input:** `what's inside https://miro.com/app/board/abc=/?moveToWidget=123`

**Action:** List items within the specified frame/container.

## Output Format

Present items clearly:

```
## Frames (3 found)
- **Design Specs** (ID: 3458764612345)
- **User Flows** (ID: 3458764612346)
- **Component Library** (ID: 3458764612347)

## Sticky Notes (12 found)
- "User feedback: navigation confusing" (ID: 3458764612350)
- "TODO: Update color palette" (ID: 3458764612351)
...
```

## Follow-up Actions

After listing items, suggest relevant next steps:
- "Would you like to explore items inside a specific frame?"
- "Should I get the content/summary of this board?"
- "Want to see images or download any specific item?"

## Board URLs and IDs

Miro tools accept board URLs directly. Extract `board_id` and `item_id` automatically from URLs like:

- `https://miro.com/app/board/uXjVK123abc=/` — Board URL
- `https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345` — URL with item focus

When a URL includes `moveToWidget` or `focusWidget`, the `item_id` is extracted automatically.

## Related Tools

For deeper exploration beyond `board_list_items`, prefer these tools:

| Tool | When to use |
|------|-------------|
| `context_explore` | High-level summary of a board's frames, documents, prototypes, tables, and diagrams (with their URLs). Best first call when the user asks "what's on this board?". |
| `context_get` | Detailed content for a specific item URL (with `moveToWidget`). Returns HTML for documents/prototype screens, AI-generated summaries for frames/diagrams, structured data for tables. |
| `image_get_url` | Download URL for an image item. |
| `image_get_data` | Image content directly. |
| `doc_get` | Document content and version (use before `doc_update` for find-and-replace edits). |

### Summarizing a board

When the user wants a summary of a whole board:

1. Call `context_explore` to discover what's on the board.
2. Present the high-level inventory.
3. For items the user wants to dig into, call `context_get` with the item URL.
