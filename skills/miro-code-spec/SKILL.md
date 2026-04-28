---
name: miro-code-spec
description: Use when the user wants to extract a Miro board's specs (documents, diagrams, prototypes, tables, frames, images) to local `.miro/specs/` files for AI-assisted planning and implementation — accepts a board URL or single-item URL.
---

# Extract Miro Specs

Extract specification content from a Miro board or item and save to `.miro/specs/` so it can be referenced during planning and implementation without repeated API calls.

The user provides one URL: a board URL (extract all spec items) or an item URL with a `moveToWidget` / `focusWidget` parameter (extract that single item). Miro MCP must be available.

## Workflow

### 1. Identify the URL from the user's request

- If the user provided a Miro URL, use it.
- If not, ask for one with AskUserQuestion.

### 2. Parse URL to Determine Type

Extract `board_id` and optionally `item_id`:
- Board URL: contains only the board ID (e.g. `uXjVK123abc=`)
- Item URL: contains `moveToWidget` or `focusWidget` parameter with item ID

### 3. Check/Prepare Output Directory

- Check if `.miro/specs/` exists and has content.
- If it has content, ask the user with AskUserQuestion:
  - "The `.miro/specs/` directory already contains files. What should I do?"
  - Options:
    - "Clean and extract fresh" — remove existing content
    - "Add to existing" — keep existing files
    - "Cancel" — abort operation
- Create the directory structure if needed:
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
- Use `context_explore` with the board URL.
- Returns high-level items: frames, documents, prototypes, tables, diagrams, and possibly other types.
- Each item includes its type, URL (with `moveToWidget` parameter), and title.
- Collect all items with their types, URLs, and titles for extraction.

**For Item URLs:**
- Extract `item_id` from URL.
- Create a single-item URL list.

### 5. Create Tasks for Extraction (MANDATORY)

🚨 **THIS STEP IS MANDATORY — DO NOT SKIP**

Use TaskCreate to create a task for EVERY item discovered. This is the only way to ensure nothing is missed.

**Task structure:**
- **Subject:** "Extract [type]: [title]" (use title if available from `context_explore`, otherwise use id)
- **Description:** Include item type, id, URL, and target file path
- **activeForm:** "Extracting [type]: [title]" (use title if available, otherwise use id)

**Example with title:**
```
Subject: "Extract document: Product Requirements"
Description: "Extract document item 3458764612345 from board. Save to .miro/specs/documents/3458764612345.md"
activeForm: "Extracting document: Product Requirements"
```

**Example without title:**
```
Subject: "Extract diagram: 3458764612347"
Description: "Extract diagram item 3458764612347 from board. Save to .miro/specs/diagrams/3458764612347.md"
activeForm: "Extracting diagram: 3458764612347"
```

**⚠️ IMPORTANT: Task Count by Type**

Create tasks according to this exact breakdown:
- Each document → **1 task**
- Each diagram → **1 task**
- Each prototype container → **1 task**
- Each prototype screen → **3 tasks** (HTML + Images + URLs)
  1. "Get and save HTML: [title]"
  2. "Extract images: [title]"
  3. "Update image URLs: [title]"
- Each frame → **1 task**
- Each table → **1 task**
- Each other item → **1 task**
- Final step → **1 task** "Finalize metadata index"

**Critical:** Prototype screens are NOT 1 task, they are 3 tasks. If you create only 1 task per screen, images will be missed.

**Naming Convention:**
- Use titles from `context_explore` for readability
- Use item IDs in file paths for uniqueness and filesystem safety

**This task creation step ensures:**
✓ All items are tracked
✓ Nothing gets skipped
✓ Progress is visible
✓ Extraction workflow is structured

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

**For most items (documents, diagrams, containers, frames, tables, other):**
1. Use TaskUpdate to mark the item's task as `in_progress`
2. Call the appropriate MCP tool to get content
3. **IMMEDIATELY** use Write tool to save content to file system
4. Read current `index.json`, add this item to items array, Write updated `index.json`
5. Use TaskUpdate to mark the item's task as `completed`

**For prototype screens (MANDATORY subagent workflow):**
- Launch a subagent (Task tool) for each screen to avoid context bloat
- Subagent performs all 3 tasks: Get HTML → Extract images → Update URLs
- Large HTML content stays in subagent context, never enters main context

**Document items:**
- Call `context_get` with the item URL → Returns Markdown content
- **MUST use Write tool** to save content to `.miro/specs/documents/[item_id].md`
- Extract title from content if available
- Update `index.json` with this item

**Diagram items:**
- Call `context_get` with the item URL → Returns AI-generated description
- **MUST use Write tool** to save content to `.miro/specs/diagrams/[item_id].md`
- Update `index.json` with this item

**Prototype container items:**
- Call `context_get` with the item URL → Returns AI-generated summary with navigation map
- **MUST use Write tool** to save to `.miro/specs/prototypes/[item_id]-container.md`
- Update `index.json` with this item

**Prototype screen items (MANDATORY 3-task workflow via subagent):**

⚠️ **EACH PROTOTYPE SCREEN REQUIRES A SUBAGENT WITH 3 SEPARATE TASKS**

**Why subagent:** `context_get` returns large HTML that bloats the main agent's context. A subagent keeps this contained — the large HTML never enters the main conversation.

For each prototype screen, launch a **single subagent** (Task tool, `subagent_type: "general-purpose"`) that performs all 3 tasks sequentially. Pass the subagent all necessary context:

**Subagent prompt template:**
```
Extract prototype screen and its images from Miro board.

Context:
- board_id: [board_id]
- item_id: [item_id]
- item_url: [item_url]
- title: [title]
- parent_url: [parent_url or "none"]
- output_dir: .miro/specs
- index_file: .miro/specs/index.json

Execute these 3 tasks in order:

Task 1: Get and save HTML
- Call `context_get` with the item URL
- Save the returned raw HTML to .miro/specs/prototypes/[item_id]-screen.html using Write tool
- Read index.json, add this item to items array, Write updated index.json

Task 2: Extract images
- Read the saved HTML file
- Parse HTML for ALL image URLs in `src` attributes
- For EACH image URL found:
  1. Extract resource ID from URL path
  2. Call `image_get_url` with board_id and the full image URL as item_id
  3. Take the download URL from response
  4. Download: `curl -sL -o .miro/specs/images/[resource_id].png "[download_url]"`
  5. Read index.json, add image entry to images array, Write updated index.json:
     {"id": "[resource_id]", "path": "images/[resource_id].png", "referenced_by": ["[item_id]"]}
- If any download fails: log warning, continue with others

Task 3: Update image URLs in HTML
- Read the HTML file from .miro/specs/prototypes/[item_id]-screen.html
- Replace ALL original image URLs with relative paths: src="../images/[resource_id].png"
- Save the updated HTML using Write tool
- Verify all image src attributes now point to ../images/

Report back: number of images found, downloaded, and any failures.
```

**Main agent workflow for each screen:**
1. Use TaskUpdate to mark "Get and save HTML: [title]" as `in_progress`
2. Launch subagent with the prompt above
3. When subagent completes, mark all 3 tasks for this screen as `completed`
4. Move to next screen

**⚠️ CRITICAL REQUIREMENTS FOR PROTOTYPE SCREENS:**
- ✗ DO NOT call `context_get` for screens from the main agent (context bloat)
- ✓ ALWAYS use a subagent for each prototype screen
- ✓ CREATE 3 tasks per prototype screen (for visibility)
- ✓ Subagent completes all 3 tasks: HTML → Images → URLs
- ✓ Use `image_get_url` with the full image URL as item_id, then curl to download
- ✓ ALL image URLs must be replaced with local paths before moving on

**Frame items:**
- Call `context_get` with the item URL → Returns AI-generated summary
- **MUST use Write tool** to save content to `.miro/specs/frames/[item_id].md`
- Update `index.json` with this item

**Table items:**
- Call `table_list_rows` with `board_id` and `item_id` → Returns structured data
- **MUST use Write tool** to save JSON content to `.miro/specs/tables/[item_id].json`
- Include column definitions and all row data in JSON
- Update `index.json` with this item

**Unknown/Other item types** (e.g., slides, or any new types):
- Call `context_get` with the item URL → Returns content (assume Markdown)
- **MUST use Write tool** to save content to `.miro/specs/other/[item_id].md`
- Preserve original type name in metadata for reference
- Update `index.json` with this item

### 8. Finalize Metadata Index

Read the current `index.json` and calculate the summary section:
- Count `total_items` from items array
- Count `by_type` (group items by type field)
- Count `total_images` from images array

Update `index.json` with the calculated summary:
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

**MUST use Write tool** to save the updated `index.json`.

### 9. Verify and Display Summary

**Verification Checklist (MUST DO):**
- [ ] Count files actually written to `.miro/specs/` directories
- [ ] Verify file count matches number of items processed
- [ ] If mismatch, identify and save any missing items
- [ ] **Prototype screens: Verify all image URLs have been replaced with local paths**
- [ ] **Check that all tasks have been marked as completed**
- [ ] Count images in `.miro/specs/images/` matches `index.json` `total_images`

**Display to user:**
- Total items extracted (by type)
- Total files written to disk
- **Total images downloaded and embedded**
- Output directory path
- Next steps: "Use these specs for planning and implementation"

**If verification fails, DO NOT report success:**
- If any prototype screens still have original image URLs in HTML → Images won't work locally
- If task count doesn't match item count → Some items were skipped
- Re-extract missing items before finishing

## Common Mistakes to Avoid

🚨 **These are the most common reasons extraction fails or is incomplete:**

1. **NOT CREATING TASKS**
   - ✗ Wrong: Extract all items without creating tasks
   - ✓ Correct: TaskCreate for every single item before extraction
   - Result: Items get skipped, no visibility into progress

2. **TREATING PROTOTYPE SCREENS AS 1 TASK**
   - ✗ Wrong: Create 1 task for a prototype screen
   - ✓ Correct: Create 3 tasks (HTML, Images, URLs) and use a subagent
   - Result: Images are never extracted

3. **CALLING context_get FOR SCREENS FROM MAIN AGENT**
   - ✗ Wrong: Call `context_get` for prototype screens directly (large HTML bloats context)
   - ✓ Correct: Launch a subagent for each screen — HTML stays in subagent context
   - Result: Main agent context overflows, extraction fails

4. **NOT PARSING HTML FOR IMAGES**
   - ✗ Wrong: Skip parsing HTML, assume no images exist
   - ✓ Correct: Search for all image `src` attributes in HTML
   - Result: Images aren't discovered or downloaded

5. **NOT UPDATING IMAGE URLS IN HTML**
   - ✗ Wrong: Download images but leave original URLs in HTML
   - ✓ Correct: Replace ALL original URLs with `../images/[id].png`
   - Result: HTML still references remote URLs instead of local files

6. **NOT TRACKING IMAGE METADATA**
   - ✗ Wrong: Download images but don't update `index.json`
   - ✓ Correct: Add image entries to `index.json` images array
   - Result: Loss of tracking which images belong to which screens

7. **NOT VERIFYING COMPLETION**
   - ✗ Wrong: Finish extraction without checking files
   - ✓ Correct: Verify all tasks completed, all images downloaded, all URLs replaced
   - Result: Incomplete extraction discovered too late

## Error Handling

- If Miro MCP is not available → inform user they need to install it
- If URL is invalid → ask user to provide valid Miro URL
- If board/item not found → show error and ask for valid URL
- If `context_get` fails for an item → log warning, continue with other items
- If image download fails → log warning, update HTML with relative path anyway (so you can see it failed)

## Implementation Notes

**File Writing:**
- **CRITICAL:** Every item retrieved from MCP MUST be written to disk using Write tool
- Pattern: MCP call → get content → Write tool → confirm saved
- Never skip the Write tool step — content only in memory is lost
- Use Write tool for ALL file types: .md, .html, .json, .png

**Directory Operations:**
- Use Bash for directory operations (mkdir, rm if cleaning)
- Create directories before writing files

**Output:**
- Keep console output concise with progress indicators
- Show what's being extracted and saved in real-time

**Prototype Screens:**
- ⚠️ **Always use a subagent** for prototype screens to avoid context bloat
- Subagent performs all 3 tasks: Get HTML → Extract images → Update URLs
- Use `image_get_url` to get download URL, then curl to save image to disk
- If image download fails for a specific image, log warning but continue with others

**Priority:**
- Prioritize documents, prototypes, and tables (most valuable for specs)
- Images are NOT optional — if prototype screens exist, image extraction is mandatory

## Background

### What is miro-spec?

The miro-spec plugin extracts specification content from Miro boards and saves it to local files. This enables AI to reference specs during planning and implementation without requiring repeated API calls.

Use it when you need to:
- Extract product requirements from Miro boards
- Save design specifications for implementation
- Download prototypes and diagrams for reference
- Create local copies of documentation from Miro
- Work with specs offline or in version control

### Content Types

| Type | Saves As | Contains |
|------|----------|----------|
| **Documents** | `.md` | Markdown content with formatting; preserved headings and structure |
| **Diagrams** | `.md` | AI-generated description; flow analysis and component relationships |
| **Prototype containers** | `.md` (suffix `-container`) | Markdown with navigation map |
| **Prototype screens** | `.html` (suffix `-screen`) | HTML markup with UI layout |
| **Tables** | `.json` | Structured data with column definitions and all row data |
| **Frames** | `.md` | AI-generated summary of frame contents |
| **Images** | `.png` | Automatically extracted from prototypes; named by Miro item ID |

### Board URLs vs Item URLs

**Board URLs** — extract complete specifications. Best for comprehensive spec extraction across all related documents and diagrams. Lists all items on the board, filters for spec-related types, extracts each individually.

**Item URLs** — extract a single document, diagram, or prototype screen. Best for targeted extraction or updating one item. Faster for single items; uses `moveToWidget` parameter.

### How Images Are Extracted

1. Plugin scans prototype screen HTML content
2. Finds Miro image URLs in `src` attributes
3. Extracts `board_id` and `item_id` from URLs
4. Downloads each image via Miro MCP
5. Replaces original URLs with relative paths

Original HTML:
```html
<img src="https://miro.com/api/v2/boards/uXjVK123abc=/images/3458764612345"/>
```

After extraction:
```html
<img src="../images/3458764612345.png"/>
```

Benefits: images work offline, no API calls needed to view documents, faster local loading, and the extracted folder can be committed to version control.

### Using Specs for Implementation Planning

Once specs are extracted, the user can ask Claude to plan or implement against them. Example prompts:

- "Review the product requirements in `.miro/specs/documents/` and create a technical implementation plan"
- "Reference the architecture diagram in `.miro/specs/diagrams/3458764612345.md` and implement the database schema"
- "Compare the authentication flow I implemented against the spec in `.miro/specs/prototypes/3458764612346-screen.html`"

Claude reads the relevant files automatically during planning. Always check `.miro/specs/index.json` first to see what was extracted.

### Best Practices

**Extraction strategy:**
- Use board URLs for initial comprehensive extraction
- Use item URLs for updating specific documents
- Extract before starting implementation
- Re-extract when specs change

**Directory management:**
- Keep `.miro/specs/` in `.gitignore` if specs are temporary
- Commit to version control if specs should be shared
- Clean extraction when board structure changes significantly
- Add to existing when updating individual items

**Working with specs:**
- Always check `index.json` first to understand what's available
- Read HTML files directly for full prototype content
- Use markdown files for quick diagram overviews
- Parse JSON files for structured table data

**Performance tips:**
- Extract from specific frames using item URLs if board is large
- Clean old extractions to avoid confusion
- Use board URLs sparingly (can be slow for large boards)
- Cache extractions between implementation sessions

### Troubleshooting

**No items extracted from board:**
- Board may not contain document/frame/table items
- Try using an item URL for specific content
- Verify the board URL is correct

**Images not downloading:**
- Some images may not be accessible via MCP
- Original URLs are preserved if download fails
- Documents remain readable with external image URLs

**Files not found after extraction:**
- Check `.miro/specs/index.json` for actual paths
- Verify extraction completed successfully
- Look for error messages in extraction output

**Large boards taking too long:**
- Use item URLs to extract specific content
- Extract individual frames instead of the entire board
- Consider filtering by content type

## See Also

- [Spec Storage Format](references/spec-storage.md) — Detailed file format documentation
- Plugin README — Installation and setup instructions
