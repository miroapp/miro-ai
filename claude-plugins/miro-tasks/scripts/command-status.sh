#!/bin/sh
# Show task tracking status

# Get the directory where this script is located
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Source the config functions
. "$SCRIPT_DIR/config.sh"

config=$(read_config)

if [ -z "$config" ]; then
  echo "Task tracking in Miro is disabled. Run: /miro-tasks:enable <table-url> to enable it."
else
  echo "$config"
fi
