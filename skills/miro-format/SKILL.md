---
name: miro-format
description: Use when the user wants a brand-new, standalone Miro item created as its own content — a document, table, diagram, timeline, kanban board, slide deck, prototyping container, activities board, or embed — not added onto a board they're already working on (e.g. "create a doc in Miro about X", "make me a Miro table for Y", "set up a kanban board for Z"). Prefer this over the document/diagram/table skills when no existing board is in play.
---

# Miro Format

Shortcut to the Miro MCP standalone format-creation tools.

Explore the format-creation tools exposed by the Miro MCP server and use them
according to their tool descriptions and parameter schemas. The MCP server is
the source of truth for which format types are supported, which tool to pick,
and all placement parameters.

## Workflow

1. Identify **what kind of format** the user wants and the content to seed it
   with. Ask if unclear.
2. If the user names a specific space or team folder to create it in, pass
   that along; otherwise it's created at the team root.
3. Pick the appropriate format-creation tool from the Miro MCP server and call
   it according to its description and parameter schema.

## When not to use this skill

If the user is adding content onto a board they already have open or have
given a URL for, use the matching content skill instead (document, diagram,
or table) — that adds a widget to the existing board rather than creating a
new standalone item.
