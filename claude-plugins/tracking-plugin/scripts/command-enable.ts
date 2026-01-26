import { writeConfig } from "./config";

function main() {
  try {
    const tableUrl = process.argv[2];
    if (!tableUrl) {
      console.error(`Table URL for tracking is required.`);
      process.exit(1);
    }

    // Validate URL has moveToWidget or focusWidget parameter
    const url = new URL(tableUrl);
    const hasMoveToWidget = url.searchParams.has("moveToWidget");
    const hasFocusWidget = url.searchParams.has("focusWidget");

    if (!hasMoveToWidget && !hasFocusWidget) {
      console.error(`URL must be a deep-link to table. It must contain moveToWidget or focusWidget parameter. Example:
  https://miro.com/app/board/xxx/?moveToWidget=123
  https://miro.com/app/board/xxx/?focusWidget=123`);
      process.exit(1);
    }
    writeConfig({
      tableUrl: tableUrl,
    });

    console.log(`Enabled tracking for table ${tableUrl}`);
  } catch {
    console.error(`Invalid URL format`);
    process.exit(1);
  }
}

main();
