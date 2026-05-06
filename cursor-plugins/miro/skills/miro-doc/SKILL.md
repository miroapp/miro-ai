---
name: miro-doc
description: Use when the user wants to create or edit a Google-Docs-style markdown document on a Miro board (meeting notes, project briefs, sprint plans, retros, decision logs).
---

# Create Document on Miro Board

Create a markdown-formatted document on the specified Miro board.

## Inputs

Identify from the user's request:
1. **board-url** (required): Miro board URL
2. **content** (optional): Document content or topic to write about

## Supported Markdown

The document supports:
- `# Heading 1` through `###### Heading 6`
- `**bold**` and `*italic*`
- `- unordered lists` and `1. ordered lists`
- `[link text](url)`

**Not supported:** Code blocks, tables, images, horizontal rules.

## Workflow

1. If board URL is missing, ask the user for it
2. If content is provided:
   - If it's actual document content, use it directly
   - If it's a topic/request, generate appropriate document content
3. If content is missing, ask what document they want to create
4. Call `doc_create` with the board URL and the markdown content. To place the document inside a frame, pass the board URL with `?moveToWidget=<frame_id>` — the tool will detect the frame target automatically (no `parent_id` argument exists). When that URL is used, `x` and `y` become coordinates relative to the frame's top-left corner; pick values that fit inside the frame's width and height (default doc width is 800px).
5. Report success with a link to the board

## Coordinates

- Board-level (URL has no `moveToWidget`): `x=0, y=0` is the board center.
- Frame target (URL has `?moveToWidget=<frame_id>`): `x=0, y=0` is the frame's top-left corner. The doc's top-left is placed at the given `x, y`, and the doc must fit inside the frame's width and height. Targets that point at a non-frame item (sticky note, shape, diagram) are silently ignored, so the doc lands on the board.

## Examples

**User input:** `create a doc on https://miro.com/app/board/abc= with: # Meeting Notes\n\n## Attendees\n- Alice\n- Bob`

**Action:** Create document with the provided markdown content.

---

**User input:** `make a sprint planning notes template doc on https://miro.com/app/board/abc=`

**Action:** Generate a sprint planning notes template document with appropriate sections.

---

**User input:** `create a document on https://miro.com/app/board/abc=`

**Action:** Ask the user what document they want to create.

## Document Templates

When generating content, consider these common document types:
- **Meeting notes** - Date, attendees, agenda, action items
- **Project brief** - Overview, goals, timeline, stakeholders
- **Sprint planning** - Sprint goal, backlog items, capacity
- **Retrospective** - What went well, improvements, action items
- **Decision log** - Context, options, decision, rationale

## Editing Existing Documents

To modify a document already on the board:

1. Call `doc_get` with the document URL to read its current content and version.
2. Call `doc_update` to apply find-and-replace edits against that version.

This is the right pattern when the user wants to amend a section or update a list rather than replace the whole doc.
