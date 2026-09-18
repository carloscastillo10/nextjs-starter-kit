import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { readGates } from "./read-gates.mjs";

const CI = readFileSync(
  fileURLToPath(new URL("../../.github/workflows/ci.yml", import.meta.url)),
  "utf8",
);

const workflow = (steps) =>
  [
    "jobs:",
    "  checks:",
    "    steps:",
    ...steps,
    "  other:",
    "    steps:",
    "      - run: pnpm nope",
  ].join("\n");

describe("readGates", () => {
  test("reads every gate out of the real workflow, so no second list can drift from it", () => {
    expect(readGates(CI).map(({ run }) => run)).toEqual([
      "pnpm format",
      "pnpm lint",
      "pnpm lint:comments",
      "pnpm types:check",
      "pnpm test",
      "pnpm spell:check",
      "pnpm lint:md",
      "pnpm env:check",
      "pnpm env:check:turbo",
      "pnpm build",
    ]);
  });

  test("names each gate the way the workflow does and leaves the setup steps out", () => {
    const gates = readGates(CI);

    expect(gates[0]).toEqual({ name: "Format", run: "pnpm format" });
    expect(gates.some(({ run }) => run.includes("pnpm install"))).toBe(false);
  });

  test("reads a gate somebody adds, in any shape, without an edit here", () => {
    const yaml = workflow([
      "      - name: Install",
      "        run: pnpm install --frozen-lockfile",
      "      - name: Something new",
      "        if: ${{ !cancelled() }}",
      "        run: |",
      "          pnpm lint:something",
      "          pnpm lint:more",
    ]);

    expect(readGates(yaml)).toEqual([
      { name: "Something new", run: "pnpm lint:something\npnpm lint:more" },
    ]);
  });

  test("refuses to report success when the marker stops matching", () => {
    expect(() => readGates(workflow(["      - name: Format", "        run: pnpm format"]))).toThrow(
      /declares no gates/u,
    );
  });

  test("says so when the job is not there at all", () => {
    expect(() => readGates("jobs:\n  other:\n    steps: []\n")).toThrow(/has no "checks" job/u);
  });
});
