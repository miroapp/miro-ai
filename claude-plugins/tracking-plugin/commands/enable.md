---
description: Enable tracking-plugin plugin with optional board URL
argument-hint: [board-url]
allowed-tools: Bash(bun:*)
---

Enable the tracking-plugin plugin to automatically manage task visualization on Miro boards.
DO NOT SKIP THIS STEP:
1. FIRST, check your available tools list for any tools starting with "mcp__miro"
    - Look at the tools you have access to in THIS session
    - DO NOT run bash commands like `ls` or check file systems
    - DO NOT use any other tools at this step - just verify Miro MCP tools exist

2. If NO Miro MCP tools exist, IMMEDIATELY STOP and notify the user that Miro MCP is not configured
    - Do not proceed with ANY other steps
    - DO not provide any extra information unless the user asks

3. If Miro MCP tools DO exist, test the connection by calling board_get_items with limit 1
    - This is the FIRST tool call you should make

4. Only proceed with enabling the plugin if Miro MCP is working
    - DO NOT use any other MCP servers or make assumptions
    - DO NOT check file systems or run bash commands before verifying Miro MCP

**What it does**:

1. Enables plugin hooks for automatic task tracking
2. Auto-approves Miro MCP calls for seamless board updates
3. Monitors TodoWrite tool usage to sync completed tasks
4. Validates task completion on session stop

**Board URL**:

You have to provide a Miro board id that you will use for tracking:
- Example: `https://miro.com/app/board/cde123=` or just `cde123=`
- The plugin will track your progress on this board

**Command**:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/scripts/plugin-config.ts enable $ARGUMENTS
```

If there's no miro board in .miro/config.json, ask a user to provide a board id before enabling it.
After enabling, use `/tracking-plugin:status` to check plugin status.