#!/usr/bin/env bun
import { c, hasBinary, type Target } from "./index.ts";
import { claudeTarget } from "./targets/claude.ts";
import { geminiTarget } from "./targets/gemini.ts";
import { codexTarget } from "./targets/codex.ts";
import { cursorTarget } from "./targets/cursor.ts";

const TARGETS: Target[] = [claudeTarget, geminiTarget, codexTarget, cursorTarget];

type Status = "ok" | "skipped" | "failed";

async function main() {
  const summary: Array<{ target: string; status: Status; note?: string }> = [];

  for (const target of TARGETS) {
    console.log(c.bold(`\n━━━ ${target.name} ━━━`));

    if (target.bin && !(await hasBinary(target.bin))) {
      console.log(c.yellow(`  ⚠ ${target.bin} not on PATH; skipping`));
      summary.push({ target: target.name, status: "skipped", note: `${target.bin} not on PATH` });
      continue;
    }

    try {
      await target.uninstall();
      summary.push({ target: target.name, status: "ok" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(c.red(`  ✗ ${msg}`));
      summary.push({ target: target.name, status: "failed", note: msg });
    }
  }

  console.log(c.bold("\n━━━ Summary ━━━"));
  for (const row of summary) {
    const colored =
      row.status === "ok" ? c.green("ok") : row.status === "skipped" ? c.yellow("skipped") : c.red("failed");
    const note = row.note ? c.dim(` — ${row.note}`) : "";
    console.log(`  ${row.target.padEnd(8)} ${colored}${note}`);
  }
  console.log();

  const anyFailed = summary.some((r) => r.status === "failed");
  process.exit(anyFailed ? 1 : 0);
}

main().catch((err) => {
  console.error(c.red(`\nFatal: ${err instanceof Error ? err.message : String(err)}`));
  process.exit(1);
});
