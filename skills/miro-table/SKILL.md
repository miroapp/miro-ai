---
name: miro-table
description: >-
  Use when the user wants to create or update a structured table on a Miro board
  with text and select (color-coded dropdown) columns — task trackers, decision
  logs, risk registers, etc.
---

# Create Table on Miro Board

Create a structured table with text and select columns on the specified Miro board.

## Inputs

Identify from the user's request:
1. **board-url** (required): Miro board URL
2. **table-name** (optional): Name/title for the table

## Column Types

- **text** - Free-form text entry
- **select** - Dropdown with predefined options (each option needs a label and hex color)

## Workflow

1. If board URL is missing, ask the user for it
2. If table name is missing, ask what kind of table they want
3. Based on the table purpose, suggest appropriate columns:
   - Propose a default column structure
   - Let user customize or accept defaults
4. Call `table_create` with the board URL, table name, and column definitions. Set `parent_id` to a frame ID if the table should sit inside a frame.
5. Report success and offer to add initial rows

## Common Table Templates

### Task Tracker
Text columns for Task and Assignee. Select columns for Status (To Do / In Progress / Done) and Priority (Low / Medium / High) with traffic-light colors.

### Decision Log
Text columns for Decision, Date, and Owner. Select column for Status (Proposed / Approved / Rejected).

### Risk Register
Text columns for Risk and Mitigation. Select columns for Impact (Low / Medium / High) and Likelihood (Unlikely / Possible / Likely) with traffic-light colors.

## Examples

**User input:** `create a "Project Tasks" table on https://miro.com/app/board/abc=`

**Action:** Create a task tracking table with Task, Assignee, Status, and Priority columns.

---

**User input:** `add a table on https://miro.com/app/board/abc=`

**Action:** Ask what kind of table the user wants to create, then suggest appropriate columns.

## Color Reference

| Color | Hex | Typical Use |
|-------|-----|-------------|
| Gray | #E0E0E0 | Not started, backlog |
| Yellow | #FFD700 | In progress |
| Green | #00FF00 | Done, approved |
| Light Green | #90EE90 | Low priority/risk |
| Orange | #FFA500 | Medium priority/risk |
| Red/Tomato | #FF6347 | High priority, blocked |

## Reading and Updating Rows

After a table exists you can move data in and out:

| Tool | Purpose |
|------|---------|
| `table_sync_rows` | Add or update rows. Set `key_column` to enable upsert behavior — rows whose key matches an existing row are updated, the rest are inserted as new. Use this for idempotent syncs from external data. |
| `table_list_rows` | Read table contents. Filter by column value using `ColumnName=Value` format. |

When the user wants to keep a Miro table in sync with a list elsewhere, prefer `table_sync_rows` with a stable `key_column` (e.g. an external ID) so re-running the sync doesn't duplicate rows.
