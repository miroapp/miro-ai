---
name: miro-diagram
description: Use when the user wants to create or update a diagram as a widget on a Miro board they're already working on. For a brand-new, standalone diagram not tied to an existing board, use the miro-format skill instead.
---

# Miro Diagram

Shortcut to the Miro MCP diagramming tools.

Explore the diagramming tools exposed by the Miro MCP server and use them
according to their tool descriptions and parameter schemas. The MCP server is
the source of truth for which diagram types and inputs are supported, which
tool to pick, the order in which tools must be called, and all placement
parameters.

## Workflow

1. Identify the **board URL**. If missing, ask.
2. Identify **what to diagram**. Ask if unclear.
3. Pick the appropriate diagramming tool from the Miro MCP server and call it
   according to its description and parameter schema.

## When not to use this skill

If the user wants a brand-new, standalone diagram — not added onto a board
they're already working on — use the miro-format skill instead. It creates
the diagram as its own content item rather than as a widget.
