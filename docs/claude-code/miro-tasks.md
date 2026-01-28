# miro-tasks Plugin

Track task execution in Miro tables. Automatically sync Claude's work with a Miro board.

## Installation

```bash
/plugin marketplace add miroapp/miro-ai
/plugin install miro-tasks@miro-ai
```

**Prerequisites:** The `miro` plugin must be installed first.

## How It Works

1. Create a task table on a Miro board
2. Enable tracking with `/miro-tasks:enable`
3. As you work, tasks are synced to the table
4. The Stop hook ensures tasks are completed before session ends

## Commands

### /miro-tasks:enable

Enable task tracking with a Miro table.

**Usage:**
```
/miro-tasks:enable <table-url>
```

**Arguments:**
- `table-url` (optional) - Deep link to a Miro table (URL with `moveToWidget` or `focusWidget` parameter)

**Finding the Table URL:**

1. Create a table on your Miro board
2. Click on the table
3. Copy the URL from your browser - it should contain `moveToWidget=` or `focusWidget=`

**Example:**
```
/miro-tasks:enable https://miro.com/app/board/abc=/?moveToWidget=3458764612345
```

If no URL is provided, Claude will:
1. Check recent conversation for table URLs
2. Ask you to confirm or provide a URL

---

### /miro-tasks:disable

Disable task tracking for the current session.

**Usage:**
```
/miro-tasks:disable
```

Stops syncing tasks to Miro. The table remains on your board.

---

### /miro-tasks:status

Show current task tracking status.

**Usage:**
```
/miro-tasks:status
```

Displays:
- Whether tracking is enabled
- The linked table URL
- Current task state

## Hooks

The plugin uses a **Stop hook** that:

1. Checks if task tracking is enabled
2. Reviews outstanding tasks before session ends
3. Prompts to complete any unfinished items
4. Updates final task status in the table

This ensures your Miro table reflects the actual work completed.

## Table Format

For best results, create a table with these columns:

| Column | Type | Purpose |
|--------|------|---------|
| Task | text | Task description |
| Status | select | To Do, In Progress, Done |
| Assignee | text | Who's working on it |
| Notes | text | Additional context |

The plugin will update the Status column as tasks progress.

## Workflow Example

```
# 1. Create a table on your Miro board with task columns

# 2. Enable tracking
/miro-tasks:enable https://miro.com/app/board/abc=/?moveToWidget=123456

# 3. Work on tasks - they sync automatically

# 4. Check status anytime
/miro-tasks:status

# 5. When done, disable or let the Stop hook finalize
/miro-tasks:disable
```

## Prerequisites

- `miro` plugin installed
- Miro MCP authenticated
- A table on your Miro board
- Table URL with `moveToWidget` or `focusWidget` parameter

## Troubleshooting

### "Table not found" Error
- Verify the URL contains `moveToWidget` or `focusWidget`
- Ensure you have access to the board
- Check that the table still exists

### Tasks Not Syncing
- Run `/miro-tasks:status` to check configuration
- Verify Miro MCP is authenticated
- Re-enable tracking if needed

### Stop Hook Not Running
- Ensure the plugin is properly installed
- Check Claude Code logs for hook errors

## Related

- [miro plugin](miro.md) - Core MCP integration
- [Overview](overview.md) - Plugin system introduction
