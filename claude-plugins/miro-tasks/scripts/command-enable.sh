#!/bin/sh
# Enable task tracking with a Miro table URL

# Get the directory where this script is located
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)

# Source the config functions
. "$SCRIPT_DIR/config.sh"

table_url="$1"

if [ -z "$table_url" ]; then
  echo "Table URL for tracking is required." >&2
  exit 1
fi

# Validate URL has moveToWidget or focusWidget parameter
case "$table_url" in
  *moveToWidget=*|*focusWidget=*)
    # URL is valid
    ;;
  *)
    echo "URL must be a deep-link to table. It must contain moveToWidget or focusWidget parameter. Example:" >&2
    echo "  https://miro.com/app/board/xxx/?moveToWidget=123" >&2
    echo "  https://miro.com/app/board/xxx/?focusWidget=123" >&2
    exit 1
    ;;
esac

# Write the config
write_config "$table_url"

echo "Enabled tracking for table $table_url"
