#!/usr/bin/env bun

/**
 * Configuration module for tracking-plugin plugin.
 * Manages reading/writing configuration from .miro/config.json
 */

import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

export interface PluginConfig {
  enabled?: boolean;
  boardUrl?: string | null;
  enabledAt?: string;
}

export function getConfigPath(): string {
  return join(process.cwd(), ".miro", "config.json");
}

export function getConfigDir(): string {
  return join(process.cwd(), ".miro");
}

export function readConfig(): PluginConfig {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Error reading config: ${error}`);
    return {};
  }
}

export function writeConfig(config: PluginConfig): void {
  const dir = getConfigDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  try {
    writeFileSync(
      getConfigPath(),
      JSON.stringify(config, null, 2) + "\n",
      "utf-8"
    );
  } catch (error) {
    console.error(`❌ Error writing config: ${error}`);
    throw error;
  }
}

export function isPluginEnabled(): boolean {
  return readConfig().enabled ?? false;
}

export function getPluginConfig(): PluginConfig {
  return readConfig();
}

export function removeConfig(): void {
  const configPath = getConfigPath();
  if (existsSync(configPath)) {
    try {
      unlinkSync(configPath);
    } catch (error) {
      console.error(`❌ Error removing config: ${error}`);
      throw error;
    }
  }
}
