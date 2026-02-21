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
reason="You MUST complete a task from this Miro table before stopping: ${table_url}

Follow these steps exactly:

STEP 1 - Discover columns:
Call table_list_rows with board_id set to the table URL above and limit set to 1. No filter.
From the response columns array, find the select-type column that represents task status (usually named Status but could vary).
Read its selectOptions to get all possible status values.

STEP 2 - Identify not-done values:
From the selectOptions, classify each value as done or not-done.
Done values are those indicating completion: Done, Completed, Finished, Closed (case-insensitive).
All other values (To Do, In Progress, Pending, Open, Blocked, etc.) are not-done.

STEP 3 - Fetch the first incomplete task:
Call table_list_rows with board_id set to the table URL above, filter_by as a JSON object mapping the status column name to the array of not-done values, and limit set to 1.
This returns the FIRST incomplete task in table order, which is the highest priority.

STEP 4 - Handle the result:
If the response total is 0, all tasks are done. Run ${CLAUDE_PLUGIN_ROOT}/scripts/command-disable.sh to disable tracking, then you may stop.
If a task is returned, complete that specific task. Do not skip it or pick a different one."

# Escape the reason for JSON (newlines to \n, quotes to \")
escaped_reason=$(printf '%s' "$reason" | sed 's/"/\\"/g' | awk '{printf "%s\\n", $0}' | sed 's/\\n$//')

printf '{"decision":"block","reason":"%s"}' "$escaped_reason"

exit 1
