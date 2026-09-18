import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "./git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("run-gates.mjs", import.meta.url));

const MARKER = "        if: ${{ !cancelled() && steps.install.outcome == 'success' }}";

const sandboxWithWorkflow = (gates) => {
  const sandbox = createSandbox();

  sandbox.write(
    ".github/workflows/ci.yml",
    [
      "jobs:",
      "  checks:",
      "    steps:",
      "      - name: Install dependencies",
      "        id: install",
      "        run: echo installing",
      ...gates.flatMap(([name, run]) => [`      - name: ${name}`, MARKER, `        run: ${run}`]),
    ].join("\n"),
  );

  return sandbox;
};

describe("run-gates", () => {
  test("runs every gate from the repository root and sums them up", () => {
    const sandbox = sandboxWithWorkflow([
      ["Format", "echo formatted"],
      ["Lint", "echo linted"],
    ]);
    const { status, stdout } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stdout).toContain("run-gates: 2 gates, from .github/workflows/ci.yml");
    expect(stdout).toContain("formatted");
    expect(stdout).not.toContain("installing");
    expect(stdout).toContain("  ✓ Format\n  ✓ Lint\n");
  });

  test("keeps going after a failing gate and fails at the end", () => {
    const sandbox = sandboxWithWorkflow([
      ["Format", "exit 3"],
      ["Lint", "echo linted"],
    ]);
    const { status, stdout, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(1);
    expect(stdout).toContain("linted");
    expect(stdout).toContain("  ✗ Format\n  ✓ Lint\n");
    expect(stderr).toContain("run-gates: Format failed");
  });

  test("fails loudly when the workflow declares no gates", () => {
    const sandbox = sandboxWithWorkflow([]);
    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(2);
    expect(stderr).toContain("declares no gates");
  });
});
