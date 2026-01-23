#!/usr/bin/env bun

/**
 * Hook script to auto-approve Miro MCP tool calls when plugin is enabled
 *
 * This is a PreToolUse hook that checks if the plugin is enabled and returns
 * an allow decision with appropriate feedback.
 */

import { isPluginEnabled } from "./config";

interface HookOutput {
  hookSpecificOutput?: {
    hookEventName: string;
    permissionDecision: string;
    permissionDecisionReason?: string;
  };
}

function main(): void {
  const output: HookOutput = {};

  if (!isPluginEnabled()) {
    // Plugin is disabled - return allow without feedback
    output.hookSpecificOutput = {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
    };
  } else {
    // Plugin is enabled - auto-approve with feedback
    output.hookSpecificOutput = {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      permissionDecisionReason: "Auto-approved MCP Miro tools by visualize-workflow plugin",
    };
  }

  console.log(JSON.stringify(output));
  process.exit(0);
}

main();
