---
description: Show current tracking-plugin plugin configuration and status
allowed-tools: Bash(bun:*)
---

Display the current status of the tracking-plugin plugin and its configuration.

**Information shown**:

- Plugin enabled/disabled status
- Associated Miro board id
- Configuration file location
- Active features and hooks

**Command**:

```bash
bun ${CLAUDE_PLUGIN_ROOT}/scripts/plugin-config.ts status
```

Use this to check if the plugin is enabled and view the current configuration.
