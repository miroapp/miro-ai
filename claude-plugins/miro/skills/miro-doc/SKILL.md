---
name: miro-doc
description: Use when the user wants to create or edit a Google-Docs-style markdown document on a Miro board.
---

# Miro Doc

Shortcut to the Miro MCP document tools.

Explore the document tools exposed by the Miro MCP server and use them
according to their tool descriptions and parameter schemas. The MCP server is
the source of truth for supported markdown, which tool to pick, the order in
which tools must be called, and all placement parameters.

## Workflow

1. Identify the **board URL**. If missing, ask.
2. Identify **what document the user wants** (provided content or a topic to
   generate from). Ask if unclear.
3. Pick the appropriate document tool from the Miro MCP server and call it
   according to its description and parameter schema.
