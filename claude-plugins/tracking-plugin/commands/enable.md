---
description: Enable tracking-plugin plugin with optional board URL
argument-hint: [board-url]
allowed-tools: Bash(bun:*)
---

Enable the tracking-plugin plugin to automatically manage task visualization on Miro boards.

**What it does**:

1. Enables plugin hooks for automatic task tracking
2. Auto-approves Miro MCP calls for seamless board updates
3. Monitors TodoWrite tool usage to sync completed tasks
4. Validates task completion on session stop

**Board URL**:

You have to provide a Miro board id that you will use for tracking:
- Example: `https://miro.com/app/board/abc123=` or just `abc123=`
- The plugin will track your progress on this board

**Command**:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/scripts/plugin-config.ts enable $ARGUMENTS
```

If there's no miro board in .miro/config.json, ask a user to provide a board id before enabling it.
After enabling, use `/tracking-plugin:status` to check plugin status.
To make sure Miro MCP is running and properly configured, get items on a miro board to see if there are data tables available. 
Ask a user to select a data table or to create a new one later when they start planning