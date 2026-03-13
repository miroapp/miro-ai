#!/usr/bin/env bash
# Miro skill preflight check
# Checks miroctl (installed + authenticated) and agent-browser (installed).
# MCP must be checked separately via MCP tool calls.
# Outputs JSON to stdout. All diagnostics go to stderr.

set -euo pipefail

json_result() {
  cat <<EOF
{
  "miroctl": {
    "installed": $1,
    "authenticated": $2,
    "token_valid": $3
  },
  "agent_browser": {
    "installed": $4
  },
  "mcp": {
    "checked": false,
    "action_required": "MUST call board_list_items(board_id=<any_board_url>, limit=1) now — this is the ONLY valid MCP test. Do NOT use context_explore (it uses narrower scopes and gives false positives). If board_list_items fails with 'Board access denied': user must remove and re-add the MCP server to re-authorize with full scopes. Any other failure: see SKILL.md preflight step 2. Do NOT proceed until board_list_items succeeds."
  }
}
EOF
}

# --- miroctl ---
miroctl_installed=false
miroctl_authenticated=false
miroctl_token_valid=false

if command -v miroctl &>/dev/null; then
  miroctl_installed=true

  # Check if a token is stored (or env var set)
  if miroctl auth status &>/dev/null; then
    miroctl_authenticated=true

    # Validate token is not expired by making a lightweight API call
    if miroctl tokens list &>/dev/null; then
      miroctl_token_valid=true
    else
      echo "miroctl: token stored but expired or invalid" >&2
    fi
  else
    echo "miroctl: no token configured" >&2
  fi
else
  echo "miroctl: not installed" >&2
fi

# --- agent-browser ---
agent_browser_installed=false

if command -v agent-browser &>/dev/null; then
  agent_browser_installed=true
elif [ -x "$HOME/.bun/bin/agent-browser" ]; then
  agent_browser_installed=true
  echo "agent-browser: found at ~/.bun/bin/agent-browser but not in PATH" >&2
else
  echo "agent-browser: not installed" >&2
fi

# --- MCP ---
echo "mcp: cannot verify from bash — agent MUST test via MCP tool call before proceeding" >&2

# --- Output ---
json_result "$miroctl_installed" "$miroctl_authenticated" "$miroctl_token_valid" "$agent_browser_installed"
