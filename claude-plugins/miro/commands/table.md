---
description: Create a table on a Miro board with specified columns
argument-hint: "[board-url] [table-name]"
---

# Create Table on Miro Board

Create a structured table with text and select columns on the specified Miro board.

## Arguments

Parse the user's input to extract:
1. **board-url** (required): Miro board URL
2. **table-name** (optional): Name/title for the table

## Column Types

- **text** - Free-form text entry
- **select** - Dropdown with predefined options (each option needs a displayValue and hex color)

## Workflow

1. If board URL is missing, ask the user for it
2. If table name is missing, ask what kind of table they want
3. Based on the table purpose, suggest appropriate columns using AskUserQuestion:
   - Propose a default column structure
   - Let user customize or accept defaults
4. Call `mcp__plugin_miro_miro__table_create` with:
   - `board_id`: The board URL
   - `title`: The table name
   - `columns`: Array of column definitions
5. Report success and offer to add initial rows

## Common Table Templates

### Task Tracker
```json
[
  {"type": "text", "title": "Task"},
  {"type": "text", "title": "Assignee"},
  {"type": "select", "title": "Status", "options": [
    {"displayValue": "To Do", "color": "#E0E0E0"},
    {"displayValue": "In Progress", "color": "#FFD700"},
    {"displayValue": "Done", "color": "#00FF00"}
  ]},
  {"type": "select", "title": "Priority", "options": [
    {"displayValue": "Low", "color": "#90EE90"},
    {"displayValue": "Medium", "color": "#FFA500"},
    {"displayValue": "High", "color": "#FF6347"}
  ]}
]
```

### Decision Log
```json
[
  {"type": "text", "title": "Decision"},
  {"type": "text", "title": "Date"},
  {"type": "text", "title": "Owner"},
  {"type": "select", "title": "Status", "options": [
    {"displayValue": "Proposed", "color": "#E0E0E0"},
    {"displayValue": "Approved", "color": "#00FF00"},
    {"displayValue": "Rejected", "color": "#FF6347"}
  ]}
]
```

### Risk Register
```json
[
  {"type": "text", "title": "Risk"},
  {"type": "text", "title": "Mitigation"},
  {"type": "select", "title": "Impact", "options": [
    {"displayValue": "Low", "color": "#90EE90"},
    {"displayValue": "Medium", "color": "#FFA500"},
    {"displayValue": "High", "color": "#FF6347"}
  ]},
  {"type": "select", "title": "Likelihood", "options": [
    {"displayValue": "Unlikely", "color": "#90EE90"},
    {"displayValue": "Possible", "color": "#FFA500"},
    {"displayValue": "Likely", "color": "#FF6347"}
  ]}
]
```

## Examples

**User input:** `/miro:table https://miro.com/app/board/abc= Project Tasks`

**Action:** Create a task tracking table with Task, Assignee, Status, and Priority columns.

---

**User input:** `/miro:table https://miro.com/app/board/abc=`

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
