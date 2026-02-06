---
description: Extract and save Miro specs to local files
argument-hint: "[url]"
allowed-tools: Bash(mkdir:*, rm:*, cat:*, echo:*), AskUserQuestion, context_explore, context_get, table_list_rows, image_get_data, Write, Read
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
  ├── documents/      # Markdown documents
  ├── diagrams/       # Diagram descriptions
  ├── prototypes/     # Containers (Markdown) and screens (HTML)
  ├── tables/         # Table JSON data
  ├── frames/         # Frame summaries
  ├── other/          # Unknown types (slides, etc.)
  └── images/         # Extracted images
  ```

### 4. Discover Items to Extract

**For Board URLs:**
- Use `context_explore` with the board URL
- Returns high-level items: frames, documents, prototypes, tables, diagrams, and potentially other types
- Each item includes its type, URL (with moveToWidget parameter), and title
- Collect all items with their types, URLs, and titles for extraction

**For Item URLs:**
- Extract item_id from URL
- Create single item URL list

### 5. Create Tasks for Extraction

Use TaskCreate to create a task for each item discovered:

**Task structure:**
- **Subject:** "Extract [type]: [title or id]"
- **Description:** Include item type, id, URL, and target file path
- **activeForm:** "Extracting [type]: [title or id]"

**Example:**
```
Subject: "Extract document: Product Requirements"
Description: "Extract document item 3458764612345 from board. Save to .miro/specs/documents/3458764612345.md"
activeForm: "Extracting document: Product Requirements"
```

**Create tasks for:**
- Each document, diagram, prototype, frame, table, or other item
- Image extraction (single task for all images after content extraction)
- Metadata index creation

This ensures all items are tracked and nothing is skipped.

### 6. Initialize Metadata Index

Create `.miro/specs/index.json` with initial structure using Write tool:
```json
{
  "board_url": "original board URL",
  "extracted_at": "ISO timestamp",
  "items": [],
  "images": [],
  "summary": {
    "total_items": 0,
    "by_type": {},
    "total_images": 0
  }
}
```

This file will be updated progressively as each item is extracted.

### 7. Extract Content from Each Item

**CRITICAL: You MUST use the Write tool to save ALL content received from MCP tools to the file system. Do not skip this step.**

**Workflow for each item (with task tracking and progressive index updates):**
1. Use TaskUpdate to mark the item's task as `in_progress`
2. Call the appropriate MCP tool to get content
3. **IMMEDIATELY** use Write tool to save content to file system
4. **For prototype screens ONLY:** Extract and save images immediately (see below)
5. Read current index.json, add this item to items array, Write updated index.json
6. Use TaskUpdate to mark the item's task as `completed`

**Document items:**
- Call `context_get` with the item URL → Returns Markdown content
- **MUST use Write tool** to save content to `.miro/specs/documents/[item_id].md`
- Extract title from content if available
- Update index.json with this item

**Diagram items:**
- Call `context_get` with the item URL → Returns AI-generated description
- **MUST use Write tool** to save content to `.miro/specs/diagrams/[item_id].md`
- Update index.json with this item

**Prototype items:**
- Call `context_get` with the item URL
- **Prototype container:** Returns AI-generated summary with navigation map
  - **MUST use Write tool** to save to `.miro/specs/prototypes/[item_id]-container.md`
  - Update index.json with this item
- **Prototype screen:** Returns Markdown with HTML representing the UI/layout
  - **MUST use Write tool** to save to `.miro/specs/prototypes/[item_id]-screen.html`
  - **IMMEDIATELY after saving:** Extract images from this screen's HTML:
    1. Parse the HTML content for presigned image URLs in `src` attributes
    2. For each presigned image URL found:
       - Extract resource ID from URL path (the item ID portion)
       - **CRITICAL:** Use Bash with curl to download immediately (URLs expire in 15 minutes)
         - Example: `curl -o .miro/specs/images/[resource_id].png "[presigned_url]"`
       - Replace presigned URL in HTML with relative path `../images/[resource_id].png`
       - Update index.json images array with this image
    3. If any images were replaced, **MUST use Write tool** to update the HTML file with relative paths
  - Update index.json with this screen item
  - **NOTE:** Image URLs from context_get have 15-minute lifetime, extract immediately

**Frame items:**
- Call `context_get` with the item URL → Returns AI-generated summary
- **MUST use Write tool** to save content to `.miro/specs/frames/[item_id].md`
- Update index.json with this item

**Table items:**
- Call `table_list_rows` with board_id and item_id → Returns structured data
- **MUST use Write tool** to save JSON content to `.miro/specs/tables/[item_id].json`
- Include column definitions and all row data in JSON
- Update index.json with this item

**Unknown/Other item types** (e.g., slides, or any new types):
- Call `context_get` with the item URL → Returns content (assume Markdown)
- **MUST use Write tool** to save content to `.miro/specs/other/[item_id].md`
- Preserve original type name in metadata for reference
- Update index.json with this item

### 8. Finalize Metadata Index

Read the current index.json and calculate the summary section:
- Count total_items from items array
- Count by_type (group items by type field)
- Count total_images from images array

Update index.json with the calculated summary:
```json
{
  "summary": {
    "total_items": 8,
    "by_type": {
      "document": 2,
      "diagram": 2,
      "prototype": 2,
      "table": 1,
      "frame": 1
    },
    "total_images": 3
  }
}
```

**MUST use Write tool** to save the updated index.json.

### 9. Verify and Display Summary

**Verification:**
- Count files actually written to `.miro/specs/` directories
- Verify file count matches number of items processed
- If mismatch, identify and save any missing items

**Display to user:**
- Total items extracted (by type)
- Total files written to disk
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

**File Writing:**
- **CRITICAL:** Every item retrieved from MCP MUST be written to disk using Write tool
- Pattern: MCP call → get content → Write tool → confirm saved
- Never skip the Write tool step - content only in memory is lost
- Use Write tool for ALL file types: .md, .html, .json, .png

**Directory Operations:**
- Use Bash for directory operations (mkdir, rm if cleaning)
- Create directories before writing files

**Output:**
- Keep console output concise with progress indicators
- Show what's being extracted and saved in real-time

**Priority:**
- Prioritize documents, prototypes, and tables (most valuable for specs)
- Images are optional - continue if image extraction fails
