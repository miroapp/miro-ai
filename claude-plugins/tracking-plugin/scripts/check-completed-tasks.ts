#!/usr/bin/env bun

/**
 * Hook script to check for incomplete tasks on session stop
 *
 * This script provides feedback to remind the user to check the Miro board
 * for incomplete tasks when the plugin is enabled.
 */

import { isPluginEnabled } from "./config";

interface HookOutput {
  systemMessage?: string;
}

function main(): void {
  const output: HookOutput = {};

  if (isPluginEnabled()) {
    // Plugin is enabled - provide system message for Stop hook
    output.systemMessage = "Check the miro data table to find tasks with status in progress or to do. Continue working until all the tasks are Done.";
  }

  console.log(JSON.stringify(output));
  process.exit(0);
}

main();
