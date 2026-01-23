#!/usr/bin/env bun

/**
 * Hook script to check for incomplete tasks on session stop
 *
 * This script provides feedback to remind the user to check the Miro board
 * for incomplete tasks when the plugin is enabled.
 */

import { isPluginEnabled } from "./config";

interface HookOutput {
  async?: boolean;
  feedback?: string;
}

function main(): void {
  const output: HookOutput = {};

  if (isPluginEnabled()) {
    // Plugin is enabled - provide feedback
    output.async = true;  // Force feedback injection
    output.feedback = "If no data table was provided in the current context, create a data table on the Miro board " +
      "with Title, Description and Status (To do, In progress, Done) " +
      "and populate it with tasks created from the plan mode. " +
      "Be specific and concise, provide the details in the Description column. Do not add ordering to the task title.";
  }

  console.log(JSON.stringify(output));
  process.exit(0);
}

main();
