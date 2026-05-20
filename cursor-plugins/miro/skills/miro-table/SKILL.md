---
name: miro-table
description: Use when the user wants to create or update a structured table on a Miro board.
---

# Miro Table

Shortcut to the Miro MCP table tools.

Explore the table tools exposed by the Miro MCP server and use them according
to their tool descriptions and parameter schemas. The MCP server is the source
of truth for supported column types and option shape, which tool to pick, the
order in which tools must be called, and all placement parameters.

## Workflow

1. Identify the **board URL**. If missing, ask.
2. Identify **what table the user wants** (title and columns, or a topic to
   propose a column set from). Ask if unclear.
3. Pick the appropriate table tool from the Miro MCP server and call it
   according to its description and parameter schema.
