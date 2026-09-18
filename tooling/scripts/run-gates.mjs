import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

import { readGates, WORKFLOW } from "./read-gates.mjs";

const repositoryRoot = () => {
  try {
    return execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();
  } catch {
    return process.cwd();
  }
};

const gatesIn = (root) => {
  try {
    return readGates(readFileSync(path.join(root, WORKFLOW), "utf8"));
  } catch (error) {
    process.stderr.write(`run-gates: ${error.message}\n`);

    return null;
  }
};

const runGate = (root, { name, run }) => {
  process.stdout.write(`\n──── ${name} ────\n\n`);

  const { status } = spawnSync(run, { cwd: root, shell: true, stdio: "inherit" });

  return { name, hasPassed: status === 0 };
};

const main = () => {
  const root = repositoryRoot();
  const gates = gatesIn(root);

  if (gates === null) return 2;

  process.stdout.write(`run-gates: ${gates.length} gates, from ${WORKFLOW}\n`);

  const results = gates.map((gate) => runGate(root, gate));
  const failed = results.filter(({ hasPassed }) => !hasPassed).map(({ name }) => name);

  process.stdout.write(
    `\n──── summary ────\n\n${results.map(({ name, hasPassed }) => `  ${hasPassed ? "✓" : "✗"} ${name}\n`).join("")}`,
  );

  if (failed.length > 0) {
    process.stderr.write(
      `\nrun-gates: ${failed.join(", ")} failed. Fix them, then run this again.\n`,
    );

    return 1;
  }

  process.stdout.write("\nrun-gates: every gate CI runs passed here.\n");

  return 0;
};

process.exitCode = main();
