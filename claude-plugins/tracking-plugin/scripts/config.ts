import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { join } from "path";

export interface PluginConfig {
  tableUrl: string;
}

export function getConfigPath(): string {
  return join(process.cwd(), ".miro", "config.json");
}

export function getConfigDir(): string {
  return join(process.cwd(), ".miro");
}

export function readConfig(): PluginConfig | null {
  const configPath = getConfigPath();
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error reading config: ${error}`);
    return null;
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
      "utf-8",
    );
  } catch (error) {
    console.error(`Error writing config: ${error}`);
    throw error;
  }
}

export function removeConfig(): void {
  const configPath = getConfigPath();
  if (existsSync(configPath)) {
    try {
      unlinkSync(configPath);
    } catch (error) {
      console.error(`Error removing config: ${error}`);
      throw error;
    }
  }
}
