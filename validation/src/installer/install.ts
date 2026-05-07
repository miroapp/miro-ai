#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { execa } from "execa";
import { c, hasBinary, type Source, type Target } from "./index.ts";
import { claudeTarget } from "./targets/claude.ts";
import { geminiTarget } from "./targets/gemini.ts";
import { codexTarget } from "./targets/codex.ts";
import { cursorTarget } from "./targets/cursor.ts";

const TARGETS: Target[] = [claudeTarget, geminiTarget, codexTarget, cursorTarget];

type Status = "ok" | "skipped" | "failed";

async function main() {
  const { values } = parseArgs({
    options: { source: { type: "string" } },
    strict: true,
  });

  const source = values.source as Source | undefined;
  if (source !== "local" && source !== "main") {
    console.error(c.red("Usage: install.ts --source=local|main"));
    process.exit(2);
  }

  const repoRoot = process.cwd();

  if (source === "local") {
    console.log(c.bold("\n→ Regenerating plugin artifacts (bun run convert)\n"));
    const result = await execa("bun", ["run", "convert"], { stdio: "inherit", cwd: repoRoot, reject: false });
    if (result.exitCode !== 0) {
      console.error(c.red(`\n✗ bun run convert failed (exit ${result.exitCode}); aborting before any installs.`));
      process.exit(result.exitCode ?? 1);
    }
  }

  const summary: Array<{ target: string; status: Status; note?: string }> = [];

  for (const target of TARGETS) {
    console.log(c.bold(`\n━━━ ${target.name} (${source}) ━━━`));

    if (target.bin && !(await hasBinary(target.bin))) {
      console.log(c.yellow(`  ⚠ ${target.bin} not on PATH; skipping`));
      summary.push({ target: target.name, status: "skipped", note: `${target.bin} not on PATH` });
      continue;
    }

    try {
      await target.install(source, repoRoot);
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
