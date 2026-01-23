#!/usr/bin/env bun

/**
 * Hook script to remind updating completed tasks on Miro board
 *
 * This script provides feedback to remind the user to update the Miro board
 * with completed tasks when the plugin is enabled.
 */

import { isPluginEnabled } from "./config";

interface HookOutput {
  feedback?: string;
}

function main(): void {
  const output: HookOutput = {};

  if (isPluginEnabled()) {
    // Plugin is enabled - provide feedback
    output.feedback = "Update Miro board to mark the tasks you just completed as Done. Keep the table updated if new tasks appear.";
  }

  console.log(JSON.stringify(output));
  process.exit(0);
}

main();
