#!/usr/bin/env bun

/**
 * Helper script to check if plugin is enabled
 * Exit code 0 = enabled, Exit code 1 = disabled
 */

import { isPluginEnabled } from "./config";

if (isPluginEnabled()) {
  process.exit(0);
} else {
  process.exit(1);
}
