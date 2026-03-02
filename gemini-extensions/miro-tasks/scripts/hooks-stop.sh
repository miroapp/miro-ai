#!/bin/sh
# Stop hook - blocks completion when tracking is enabled

# Get the directory where this script is located
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Source the config functions
. "$SCRIPT_DIR/config.sh"

table_url=$(read_table_url)

# If no config, exit silently
if [ -z "$table_url" ]; then
  exit 0
fi

# Output block decision with reason
# Note: Using heredoc-style message for clarity, then escaping for JSON
reason="Get ONE incomplete task from the table and complete it: ${table_url}
Use table_list_rows with filters to fetch tasks that are in progress or incomplete.
- Completed statuses are typically named: Done, Completed, Finished, Closed, etc.
- Pick any task with a different status (e.g., To Do, In Progress, Pending, etc.)
When all tasks are complete, run ${extensionPath}/scripts/command-disable.sh to disable tracking."

# Escape the reason for JSON (newlines to \n, quotes to \")
escaped_reason=$(printf '%s' "$reason" | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

printf '{"decision":"block","reason":"%s"}' "$escaped_reason"

exit 1
