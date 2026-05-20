---
name: skills-development
description: Use when authoring or revising plugin SKILL.md files in this repo. Captures the principles for keeping skills as compact shortcuts to MCP tool groups.
---

# Skills Development

Principles for writing SKILL.md files in this repo:

- **Do not duplicate** parameter definitions or tool descriptions.
  Duplication drifts, contradicts the live tools, and steers the agent
  away from features that work.
- The agent must **fetch parameter definitions and tool descriptions
  from the MCP server directly** at call time.
- **Do not name specific tools, prefixes, or suffixes.** The agent
  finds them in the MCP tool list.
- **Do not name specific parameters either.** Describe values in prose
  ("the board item ID", "the image resource ID") rather than introducing
  code-shaped names (`item_id`, `board_id`). Parameter names drift the
  same way tool names do, and the agent should read the live MCP schema.
