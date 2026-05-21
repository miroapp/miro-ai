# MCP Tools Reference

The Miro MCP server is the source of truth for tool names, parameters, and enum values. This page is a high-level map of what the server is capable of — for the live tool list and complete parameter schemas, see [developers.miro.com](https://developers.miro.com/docs/miro-mcp-prompts).

Most AI clients also expose the live tool list directly. Ask your client to list the Miro MCP tools, or have it call them — the descriptions and parameter schemas it sees at call time are always current.

## What the server can do

The Miro MCP server groups its tools into a few broad capabilities:

- **Board context and browsing** — high-level overview of a board, filtered listings of items, and per-item content retrieval.
- **Diagram creation** — generate diagrams (flowcharts, mind maps, UML class and sequence, ER) from a DSL or Mermaid-style description.
- **Document creation and editing** — create Google-Docs-style markdown documents on a board, and update existing ones via find-and-replace.
- **Table creation and sync** — create structured tables with typed columns and idempotently sync rows from external data.
- **Image retrieval** — fetch image content or download URLs for image items on a board.

## Board URLs

Tools accept full Miro board URLs. URLs that include `moveToWidget` or `focusWidget` parameters scope the operation to a specific item on the board — the item identifier is extracted from the URL automatically.

## Further reading

- [Miro MCP Tools & Prompts](https://developers.miro.com/docs/miro-mcp-prompts) — complete tool list with parameter schemas
- [Miro MCP Overview](https://developers.miro.com/docs/miro-mcp) — server architecture, auth, and rate limits
