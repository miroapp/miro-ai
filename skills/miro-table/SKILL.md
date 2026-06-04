---
name: miro-table
description: "Creates, populates, and updates structured tables with typed columns on Miro boards. Use when the user wants to build a table, task tracker, decision log, risk register, or any row-and-column layout — including adding rows, updating cells, or defining columns with text or color-coded select dropdowns."
---

# Miro Table

Shortcut to the Miro MCP table tools. Explore the table tools exposed by the
Miro MCP server and use them according to their tool descriptions and parameter
schemas. The MCP server is the source of truth for supported column types,
option shapes, tool ordering, and all placement parameters.

## Capabilities

- **Typed columns** — text columns and color-coded select-dropdown columns
  (e.g. Status: To Do / In Progress / Done).
- **Built-in templates** — task trackers, decision logs, and risk registers.
- **Idempotent row updates** — rows can be keyed by a stable identifier column
  so repeated calls update existing rows rather than duplicating them.
- **Read-back** — retrieve table rows for use in downstream workflows.

## Workflow

1. Identify the **board URL**. If missing, ask.
2. Identify **what the user wants**:
   - A new table from scratch (title, columns, optional initial rows).
   - A table from a built-in template (task tracker, decision log, risk
     register).
   - An update to an existing table (add rows, edit cells, add columns).
   Ask if unclear.
3. Explore the table tools on the Miro MCP server and pick the appropriate one
   based on its description and parameter schema.
4. Call the chosen tool. When creating select-dropdown columns, define the
   options and colour codes as the MCP schema requires before adding rows.
5. **Verify**: confirm the table exists on the board and that the column count
   and row count match what was requested.
