import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "./git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("check-branch-scope.mjs", import.meta.url));

const filesIn = (folder, count) =>
  Array.from({ length: count }, (_, index) => `${folder}/file-${index}.ts`);

const sandboxWithBranch = (files) => {
  const sandbox = createSandbox();

  sandbox.commit("Start");
  sandbox.git(["switch", "--quiet", "--create", "feat/settings-page"]);
  sandbox.commit("Work", { files });

  return sandbox;
};

describe("check-branch-scope", () => {
  test("reports a branch that mixes the app with the tooling, without failing", () => {
    const sandbox = sandboxWithBranch([
      ...filesIn("apps/web/src", 3),
      ...filesIn("tooling/eslint", 3),
    ]);
    const { status, stdout } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stdout).toContain("This branch changes 2 unrelated things");
    expect(stdout).toMatch(/product\s+3 files/u);
    expect(stdout).toMatch(/tooling\s+3 files/u);
  });

  test("fails the same branch with --strict", () => {
    const sandbox = sandboxWithBranch([
      ...filesIn("apps/web/src", 3),
      ...filesIn(".github/workflows", 3),
    ]);

    expect(sandbox.run(SCRIPT, ["--strict"]).status).toBe(1);
  });

  test("passes one concern with the docs and root files that travel with it", () => {
    const sandbox = sandboxWithBranch([
      ...filesIn("apps/web/src", 3),
      "docs/guide.md",
      "tooling/spell-check/project-words.txt",
      "package.json",
    ]);
    const { status, stdout, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).toContain("one concern (product), ok");
  });

  test("reports a branch too large to review closely", () => {
    const sandbox = sandboxWithBranch(filesIn("apps/web/src", 41));
    const { status, stdout } = sandbox.run(SCRIPT, ["--strict"]);

    expect(status).toBe(1);
    expect(stdout).toContain("41 files and 41 changed lines");
  });

  test("says so when the branch changes nothing", () => {
    const sandbox = createSandbox();

    sandbox.commit("Start");

    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stderr).toBe("check-branch-scope: nothing changed against main\n");
  });

  test("skips, without blocking the push, a base it shares no history with", () => {
    const sandbox = createSandbox();

    sandbox.commit("Start");
    sandbox.git(["switch", "--quiet", "--orphan", "feat/unrelated"]);
    sandbox.commit("Unrelated", { files: filesIn("apps/web/src", 3) });

    const { status, stderr } = sandbox.run(SCRIPT, ["main"]);

    expect(status).toBe(0);
    expect(stderr).toContain("could not compare against main, skipped");
  });

  test("skips a base it cannot resolve", () => {
    const sandbox = sandboxWithBranch(filesIn("apps/web/src", 3));
    const { status, stderr } = sandbox.run(SCRIPT, ["nope"]);

    expect(status).toBe(0);
    expect(stderr).toContain('"nope" is not a commit this repository knows, skipped');
  });
});
