#!/bin/sh
# Shared configuration functions for miro-tasks
# This file is sourced by other scripts

# Get the config directory path (relative to current working directory)
get_config_dir() {
  printf '%s/.miro' "$PWD"
}

# Get the config file path
get_config_path() {
  printf '%s/.miro/config.json' "$PWD"
}

# Read config and output the tableUrl value (empty if not found)
read_config() {
  config_path=$(get_config_path)
  if [ ! -f "$config_path" ]; then
    return 1
  fi
  cat "$config_path"
}

# Read just the tableUrl value from config
read_table_url() {
  config_path=$(get_config_path)
  if [ ! -f "$config_path" ]; then
    return 1
  fi
  # Extract tableUrl value using sed (handles simple JSON structure)
  sed -n 's/.*"tableUrl"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$config_path"
}

# Write config with the given tableUrl
write_config() {
  table_url="$1"
  config_dir=$(get_config_dir)
  config_path=$(get_config_path)

  # Create directory if it doesn't exist
  if [ ! -d "$config_dir" ]; then
    mkdir -p "$config_dir"
  fi

  # Write JSON config
  printf '{\n  "tableUrl": "%s"\n}\n' "$table_url" > "$config_path"
}

# Remove the config file
remove_config() {
  config_path=$(get_config_path)
  if [ -f "$config_path" ]; then
    rm "$config_path"
  fi
}
