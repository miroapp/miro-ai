---
description: Disable visualize-workflow plugin and stop automatic task tracking
allowed-tools: Bash(bun:*)
---

Disable the visualize-workflow plugin to stop automatic task tracking and Miro board updates.

**What it does**:

1. Disables all plugin hooks
2. Updates configuration file to set `"enabled": false`
3. Stops automatic Miro board updates
4. Stops task completion validation

**Command**:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/scripts/plugin-config.ts disable
```

Use this when you want to temporarily disable the plugin or when you no longer need automatic task tracking. You can re-enable it anytime with `/visualize-workflow:enable`.
