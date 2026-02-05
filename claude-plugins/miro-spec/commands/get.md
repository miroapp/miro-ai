---
description: Extract and save Miro specs to local files
argument-hint: "[url]"
allowed-tools: Bash(mkdir:*, rm:*, cat:*, echo:*), AskUserQuestion, mcp__miro__context_explore, mcp__miro__context_get, mcp__miro__table_list_rows, mcp__miro__image_get_data, Write, Read
---

# Extract Miro Specs

Extract specification content from a Miro board or item and save to `.miro/specs/` directory for AI-assisted planning and implementation.

## Prerequisites

1. Miro MCP must be enabled
2. User must provide a Miro board or item URL

## URL Format Support

This command accepts:
- **Board URLs:** `https://miro.com/app/board/uXjVK123abc=/` - extracts all spec items from the board
- **Item URLs:** `https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345` - extracts single item

## Implementation Steps

### 1. Get URL from Arguments

- If `$ARGUMENTS` is provided → use it as the URL
- If not provided → ask user for URL using AskUserQuestion

### 2. Parse URL to Determine Type

Extract board_id and optionally item_id from URL:
- Board URL: contains only board ID (e.g., `uXjVK123abc=`)
- Item URL: contains `moveToWidget` or `focusWidget` parameter with item ID

### 3. Check/Prepare Output Directory

- Check if `.miro/specs/` directory exists and has content
- If it has content, ask user using AskUserQuestion:
  - "The `.miro/specs/` directory already contains files. What should I do?"
  - Options:
    - "Clean and extract fresh" - remove existing content
    - "Add to existing" - keep existing files
    - "Cancel" - abort operation
- Create directory structure if needed:
  ```
  .miro/specs/
  ├── documents/
  ├── diagrams/
  ├── prototypes/
  ├── tables/
  ├── frames/
  ├── other/
  └── images/
  ```

### 4. Discover Items to Extract

**For Board URLs:**
- Use `mcp__miro__context_explore` with the board URL
- Returns high-level items: frames, documents, prototypes, tables, diagrams, and potentially other types
- Each item includes its type, URL (with moveToWidget parameter), and title
- Collect all items with their types, URLs, and titles for extraction

**For Item URLs:**
- Extract item_id from URL
- Create single item URL list

### 5. Extract Content from Each Item

For each item discovered:

**Document items:**
- Call `mcp__miro__context_get` with the item URL
- Returns Markdown content of the document
- Save to `.miro/specs/documents/[item_id].md`
- Extract title from content if available

**Diagram items:**
- Call `mcp__miro__context_get` with the item URL
- Returns AI-generated description and analysis
- Save to `.miro/specs/diagrams/[item_id].md`

**Prototype items:**
- Call `mcp__miro__context_get` with the item URL
- **Prototype container:** Returns AI-generated summary with navigation map of all screens
  - Save to `.miro/specs/prototypes/[item_id]-container.md`
- **Prototype screen:** Returns Markdown with HTML representing the UI/layout
  - Save to `.miro/specs/prototypes/[item_id]-screen.html`

**Frame items:**
- Call `mcp__miro__context_get` with the item URL
- Returns AI-generated summary of frame contents
- Save to `.miro/specs/frames/[item_id].md`

**Table items:**
- Call `mcp__miro__table_list_rows` with board_id and item_id
- Returns structured table data with columns and rows
- Save to `.miro/specs/tables/[item_id].json`
- Include column definitions and all row data

**Unknown/Other item types** (e.g., slides, or any new types):
- Call `mcp__miro__context_get` with the item URL
- Assume Markdown format for the returned content
- Save to `.miro/specs/other/[item_id].md`
- Preserve original type name in metadata for reference

### 6. Extract Images from Prototypes

For all prototype screen HTML files saved:
- Parse HTML for Miro image URLs
- Pattern to match: `https://miro.com/...` URLs in `src` attributes
- Extract image URLs and associated item IDs

### 7. Download Images

For each image URL found:
- Extract resource ID from the image URL (e.g., `3458764517562141899` from the URL path)
- Call `mcp__miro__image_get_data` with:
  - `board_id`: the board ID
  - `item_id`: the **full image URL** (not just the resource ID)
- Save image to `.miro/specs/images/[resource_id].png`
- Track mapping of original URL to local path

### 8. Replace Image URLs in Prototype Screens

For each prototype screen HTML file:
- Read the file content
- Replace Miro image URLs with relative paths: `../images/[resource_id].png`
- Write updated content back to file

### 9. Create Metadata Index

Create `.miro/specs/index.json` with:
```json
{
  "board_url": "original board URL",
  "extracted_at": "ISO timestamp",
  "items": [
    {
      "id": "item_id",
      "type": "document|diagram|prototype|frame|table|other",
      "original_type": "original type name from Miro (for 'other' items)",
      "title": "Item title if available",
      "path": "relative path to file",
      "url": "original item URL"
    }
  ],
  "images": [
    {
      "id": "image_id",
      "path": "images/[item_id].png"
    }
  ]
}
```

### 10. Display Summary

Show user:
- Total items extracted (by type)
- Total images downloaded
- Output directory path
- Next steps: "Use these specs for planning and implementation"

## Error Handling

- If Miro MCP is not available → inform user they need to install it
- If URL is invalid → ask user to provide valid Miro URL
- If board/item not found → show error and ask for valid URL
- If context_get fails for an item → log warning, continue with other items
- If image download fails → log warning, keep original URL in HTML

## Example Usage

```
User: /miro-spec:get https://miro.com/app/board/uXjVK123abc=/
→ Extracts all spec items from board

User: /miro-spec:get https://miro.com/app/board/uXjVK123abc=/?moveToWidget=3458764612345
→ Extracts single item
```

## Implementation Notes

- Use Write tool to create JSON and HTML files
- Use Bash for directory operations (mkdir, rm if cleaning)
- Keep console output concise with progress indicators
- Prioritize documents, prototypes, and tables (most valuable for specs)
- Images are optional - continue if image extraction fails
