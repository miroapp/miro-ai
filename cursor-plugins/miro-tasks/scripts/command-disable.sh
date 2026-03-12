#!/bin/sh
# Disable task tracking

# Get the directory where this script is located
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Source the config functions
. "$SCRIPT_DIR/config.sh"

remove_config

echo "Task tracking in Miro is disabled."
