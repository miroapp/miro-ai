import { execa } from "execa";

export const GITHUB_OWNER_REPO = "miroapp/miro-ai";
export const GITHUB_URL = `https://github.com/${GITHUB_OWNER_REPO}`;
export const PLUGIN_NAME = "miro";
export const MARKETPLACE_NAME = "miro-ai";

export type Source = "local" | "main";

export interface Target {
  name: string;
  bin: string | null;
  install(source: Source, repoRoot: string): Promise<void>;
  uninstall(): Promise<void>;
}

export const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};

export class CommandError extends Error {
  constructor(
    public bin: string,
    public args: string[],
    public exitCode: number,
    public stdout: string,
    public stderr: string
  ) {
    super(`Command failed: ${bin} ${args.join(" ")} (exit ${exitCode})`);
  }
}

export async function hasBinary(bin: string): Promise<boolean> {
  try {
    await execa("which", [bin], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function exec(bin: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  console.log(c.dim(`  $ ${bin} ${args.join(" ")}`));
  const result = await execa(bin, args, { reject: false });
  if (result.stdout) process.stdout.write(result.stdout.endsWith("\n") ? result.stdout : result.stdout + "\n");
  if (result.stderr) process.stderr.write(result.stderr.endsWith("\n") ? result.stderr : result.stderr + "\n");
  if ((result.exitCode ?? 1) !== 0) {
    throw new CommandError(bin, args, result.exitCode ?? 1, result.stdout ?? "", result.stderr ?? "");
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

export async function execAllowing(
  bin: string,
  args: string[],
  acceptable: RegExp[]
): Promise<void> {
  try {
    await exec(bin, args);
  } catch (err) {
    if (!(err instanceof CommandError)) throw err;
    const haystack = `${err.stdout}\n${err.stderr}`;
    if (acceptable.some((p) => p.test(haystack))) {
      console.log(c.dim(`  · tolerated (matched expected absence)`));
      return;
    }
    throw err;
  }
}
