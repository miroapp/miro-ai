---
name: miro-browse
description: Use when the user wants to explore, list, summarize, or inspect items and spatial relationships on a Miro board.
---

# Miro Browse

Use the Miro MCP read tools deliberately: SVG for spatial board exploration,
raw item listing for inventory, and context tools only for semantic detail.

## Workflow

1. Identify the **board URL**. Preserve any `moveToWidget` or `focusWidget`
   target because it identifies the item the user cares about.
2. Identify the request shape:
   - **Whole-board structure or summary** → start with `canvas_read_as_svg`.
   - **Filtered or paginated inventory** → use `board_list_items` directly.
   - **One specific item or semantic explanation** → use `context_get` with
     the targeted item URL.
   - **Image or downloadable asset** → use the matching image/asset read tool.
3. For whole-board exploration, call `canvas_read_as_svg` once with
   `invocation_source: "skill"` and `is_repository` set for the workspace. Read the SVG's frames, positions, connectors,
   `data-miro-id` values, and hydrated document/table content to understand the
   board without paying for an AI-generated overview.
4. Expand only when necessary:
   - If the SVG response reports truncation, page through `board_list_items`
     until the question is answered; do not fetch the rest of a large board
     automatically.
   - If `skipped_count` is non-zero or the question needs richer meaning, call
     `context_explore`, then `context_get` only for the relevant item URLs.
   - Avoid a whole-board `context_get` after an SVG read: it duplicates work and
     consumes Miro AI credits.
5. Summarize what matters to the user's question. Preserve spatial facts from
   the SVG (grouping, order, containment, and connections) and distinguish them
   from any interpretation produced by a context tool.
