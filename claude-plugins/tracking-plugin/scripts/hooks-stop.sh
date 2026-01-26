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
printf '{"decision":"block","reason":"Use Miro MCP to get the next task that is not done and get it done in %s!\\n    If there are no tasks left just run %s/scripts/command-disable.sh script to disable tracking"}' "$table_url" "$CLAUDE_PLUGIN_ROOT"

exit 1
