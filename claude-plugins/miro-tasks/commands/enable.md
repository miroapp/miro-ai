---
description: Enable miro-tasks plugin with optional board URL
argument-hint: "[table-url]"
allowed-tools: Bash(sh:*), AskUserQuestion
---

# Enable task tracking in Miro

This command enables tracking of tasks execution in a Miro table.

## Prerequisites

1. Make sure that Miro MCP is enabled. If it's not enabled there is nothing you can do to track tasks in Miro. Ask User to install Miro MCP server.
2. You need a **deep link to a Miro table** (URL with `moveToWidget` or `focusWidget` parameter).

## Finding the Table URL

Follow this logic to determine the table URL:

1. **If `$ARGUMENTS` contains a URL** → use it directly (user explicitly provided it)
   - Runs script ${CLAUDE_PLUGIN_ROOT}/scripts/command-enable.sh <TABLE_URL>
   - Replace `<TABLE_URL>` with the actual table deep link URL.
2. **If no argument provided**, check the conversation context for a recently created or referenced table:
   - Look for Miro table URLs with `moveToWidget=` or `focusWidget=` parameter
   - If found, **ask user to confirm** using AskUserQuestion before enabling:
     - Question: "Should I use this table for task tracking?"
     - Show the table URL you found
     - Options: "Yes, use this table" / "No, I'll provide a different URL"
3. **If no URL found anywhere** → ask the user using AskUserQuestion:
   - Question: "Which Miro table should I use for task tracking?"
   - Explain they need to provide a deep link URL (with moveToWidget or focusWidget parameter)
