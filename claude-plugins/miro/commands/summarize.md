---
description: Generate documentation or summary from a Miro board
argument-hint: "[board-url] [doc-type?]"
---

# Summarize Miro Board Content

Extract structured documentation from a Miro board's visual content.

## Arguments

Parse the user's input to extract:
1. **board-url** (required): Miro board URL
2. **doc-type** (optional): Type of documentation to generate

## Document Types

| Type | Description |
|------|-------------|
| `project_summary` | High-level overview (recommended starting point) |
| `style_guide` | Design tokens, colors, typography |
| `screen_design_requirements` | UI/UX specifications per screen |
| `screen_functional_requirements` | Feature requirements per screen |
| `general_board_document` | Generic content extraction |
| `technical_specification` | Technical implementation details |
| `functional_requirements` | Business requirements |
| `non_functional_requirements` | Performance, security, scalability |
| `prototypes` | Interactive prototype HTML/CSS |

## Workflow

1. If board URL is missing, ask the user for it
2. If doc-type is not specified:
   - First call with `["project_summary"]` to understand the board
   - Present the summary and ask what specific documentation they need
3. If doc-type is specified:
   - Call with the requested document type(s)
4. Call `mcp__plugin_miro_miro__context_get_board_docs` with:
   - `board_id`: The board URL
   - `document_types`: Array of requested types
   - `item_id`: (optional) Filter to specific frame if URL contains moveToWidget
5. Present the extracted documentation to the user

## Examples

**User input:** `/miro:summarize https://miro.com/app/board/abc=`

**Action:** Generate project_summary first, then offer to generate more specific documentation based on board content.

---

**User input:** `/miro:summarize https://miro.com/app/board/abc= style_guide`

**Action:** Extract and present the style guide documentation.

---

**User input:** `/miro:summarize https://miro.com/app/board/abc=/?moveToWidget=123 technical_specification`

**Action:** Extract technical specification from the specific frame/item indicated in the URL.

## Tips

- **Start with project_summary** - It provides recommendations for which document types are most relevant
- **Filter by frame** - For large boards, focus on specific frames using URLs with `moveToWidget` parameter
- **Multiple types** - Request multiple document types in one call for comprehensive coverage: `["functional_requirements", "technical_specification"]`
- **Prototypes** - When extracting prototypes, images are returned as Miro URLs that can be downloaded with `miro__board_get_image_download_url`
