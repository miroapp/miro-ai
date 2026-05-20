---
name: miro-browse
description: Use when the user wants to explore, list, summarize, or inspect items on a Miro board.
---

# Miro Browse

Shortcut to the Miro MCP browsing and context tools.

Explore the browsing and context tools exposed by the Miro MCP server and use
them according to their tool descriptions and parameter schemas. The MCP
server is the source of truth for which tools exist (board-level overview,
item-level content, item listing/filtering, image and asset retrieval), which
tool to pick, how to chain them, and all parameters.

## Workflow

1. Identify the **board URL**. If the user's URL targets a specific item
   (frame, document, prototype screen, etc.), preserve it — Miro MCP tools
   use that target to scope their response.
2. Identify **what the user wants to learn**: a high-level overview of the
   whole board, a filtered listing of items of a certain type, the contents
   of one specific item, or a downloadable asset. Ask if unclear.
3. Pick the appropriate browsing or context tool from the Miro MCP server and
   call it per its description. For a board summary, start with the
   high-level overview tool and then drill into individual items with the
   item-level retrieval tool as the user's questions get more specific.
