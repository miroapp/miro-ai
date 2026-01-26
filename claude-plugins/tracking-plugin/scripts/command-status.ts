import { readConfig } from "./config";

function main(): void {
  const config = readConfig();
  if (!config) {
    console.log(
      `Task tracking in Miro is disabled. Run: /tracking-plugin:enable <table-url> to enable it.`,
    );
  } else {
    console.log(config);
  }
}

main();
