#!/usr/bin/env bun

/**
 * Plugin configuration manager for visualize-workflow
 *
 * Manages enable/disable/status functionality for the plugin.
 *
 * Usage:
 *   bun scripts/plugin-config.ts enable [board-url]  - Enable plugin with optional board URL
 *   bun scripts/plugin-config.ts disable              - Disable plugin
 *   bun scripts/plugin-config.ts status               - Show current status
 */

import {
  writeConfig,
  removeConfig,
  isPluginEnabled,
  getPluginConfig,
  getConfigPath,
} from "./config";

/**
 * Enable the plugin
 */
function enablePlugin(boardUrl?: string): void {
  const config = {
    enabled: true,
    boardUrl: boardUrl || null,
    enabledAt: new Date().toISOString(),
  };

  writeConfig(config);

  console.log("✅ Enabled visualize-workflow plugin");
  if (boardUrl) {
    console.log(`📋 Board URL: ${boardUrl}`);
  }
  console.log(`📝 Config saved to: ${getConfigPath()}`);
  console.log("\nThe plugin will now:");
  console.log("  • Auto-approve Miro MCP calls");
  console.log("  • Update completed tasks on Miro boards");
  console.log("  • Check task completion on session stop");
}

/**
 * Disable the plugin
 */
function disablePlugin(): void {
  const wasEnabled = isPluginEnabled();

  removeConfig();

  if (wasEnabled) {
    console.log("✅ Disabled visualize-workflow plugin");
    console.log(`📝 Removed config: ${getConfigPath()}`);
    console.log("\nPlugin hooks will no longer execute");
  } else {
    console.log("ℹ️  Plugin was not enabled");
  }
}

/**
 * Check plugin status
 */
function checkStatus(): void {
  if (!isPluginEnabled()) {
    console.log("ℹ️  Plugin is disabled");
    console.log("\nTo enable the plugin, run:");
    console.log("  /visualize-workflow:enable [board-url]");
    return;
  }

  const config = getPluginConfig();

  console.log("📊 Plugin Status\n");
  console.log("✅ Status: ENABLED");
  if (config.boardUrl) {
    console.log(`📋 Board URL: ${config.boardUrl}`);
  }
  if (config.enabledAt) {
    console.log(`🕐 Enabled at: ${new Date(config.enabledAt).toLocaleString()}`);
  }
  console.log(`📁 Config: ${getConfigPath()}`);

  console.log("\n🎯 Active Features:");
  console.log("  • Auto-approve Miro MCP calls");
  console.log("  • Update completed tasks on Miro boards");
  console.log("  • Check task completion on session stop");
}

/**
 * Show help
 */
function showHelp(): void {
  console.log(`
Visualize Workflow Plugin Configuration

Usage:
  bun scripts/plugin-config.ts <command> [arguments]

Commands:
  enable [board-url]   Enable the plugin with optional Miro board URL
  disable              Disable the plugin
  status               Show current plugin status
  help                 Show this help message

Examples:
  bun scripts/plugin-config.ts enable
  bun scripts/plugin-config.ts enable https://miro.com/app/board/abc123=
  bun scripts/plugin-config.ts status
  bun scripts/plugin-config.ts disable

Configuration location:
  .miro/config.json
  `);
}

/**
 * Main entry point
 */
function main(): void {
  const command = process.argv[2];

  switch (command) {
    case "enable": {
      const boardUrl = process.argv[3];
      enablePlugin(boardUrl);
      break;
    }

    case "disable": {
      disablePlugin();
      break;
    }

    case "status": {
      checkStatus();
      break;
    }

    case "help":
    case "--help":
    case "-h": {
      showHelp();
      break;
    }

    default: {
      console.error(`❌ Unknown command: ${command}`);
      console.error('Run "bun scripts/plugin-config.ts help" for usage information');
      process.exit(1);
    }
  }
}

main();
