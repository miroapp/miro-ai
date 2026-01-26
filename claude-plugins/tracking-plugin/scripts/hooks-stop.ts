import { readConfig } from "./config";

function main(): void {
  const config = readConfig();
  if (!config) {
    return;
  }
  const output = {
    decision: "block",
    reason: `Use Miro MCP to get the next task that is not done and get it done in ${config?.tableUrl}!
    If there are no tasks left just run ${process.env.CLAUDE_PLUGIN_ROOT}/scripts/command-disable.ts script to disable tracking`,
  };
  console.log(JSON.stringify(output));
  process.exit(1);
}

main();
