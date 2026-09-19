import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, onTestFinished, test } from "vitest";

import { createSandbox } from "../git/git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("check-comments.mjs", import.meta.url));

const createWorkspace = (files) => {
  const directory = mkdtempSync(path.join(tmpdir(), "check-comments-"));

  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  for (const [name, code] of Object.entries(files)) writeFileSync(path.join(directory, name), code);

  return directory;
};

const runCheck = (directory, files = []) => {
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT, ...files], {
    cwd: directory,
    encoding: "utf8",
  });

  return { status, output: stdout };
};

const git = (directory, args) => {
  execFileSync("git", args, { cwd: directory, stdio: "ignore" });
};

describe("check-comments with named files", () => {
  test("prints only the summary and exits 0 when the files are clean", () => {
    const directory = createWorkspace({
      "retries.ts":
        "// The provider drops the first request after a deploy.\nexport const retries = 2;\n",
    });

    expect(runCheck(directory, ["retries.ts"])).toEqual({
      status: 0,
      output: "check-comments: 1 files, 0 failures\n",
    });
  });

  test("lists each failure under its file and exits 1", () => {
    const directory = createWorkspace({
      "build.ts": "// Read by next.config.ts at build time.\nexport const target = 1;\n",
    });

    expect(runCheck(directory, ["build.ts"])).toEqual({
      status: 1,
      output:
        'build.ts\n  x line 1 cites a file name: "next.config.ts"\ncheck-comments: 1 files, 1 failures\n',
    });
  });

  test("prints reports without failing", () => {
    const directory = createWorkspace({
      "total.ts": "// const total = 1;\nexport const total = 1;\n",
    });

    expect(runCheck(directory, ["total.ts"])).toEqual({
      status: 0,
      output:
        "total.ts\n  ! line 1 may be commented-out code\ncheck-comments: 1 files, 0 failures\n",
    });
  });

  test("prints file-wide reports without a line number", () => {
    const code = Array.from(
      { length: 10 },
      (_, i) => `// Reason ${i}.\nexport const value${i} = ${i};`,
    );
    const directory = createWorkspace({ "values.ts": code.join("\n") });

    expect(runCheck(directory, ["values.ts"]).output).toBe(
      "values.ts\n  ! 50% of the non-blank lines are comments\ncheck-comments: 1 files, 0 failures\n",
    );
  });

  test("ignores named files that are not checked sources", () => {
    const directory = createWorkspace({ "notes.md": "See apps/web/README.md.\n" });

    expect(runCheck(directory, ["notes.md"])).toEqual({
      status: 0,
      output: "check-comments: 0 files, 0 failures\n",
    });
  });
});

describe("check-comments without arguments", () => {
  test("checks the files git tracks and leaves untracked files alone", () => {
    const directory = createWorkspace({
      "tracked.ts": "// Works around #42.\nexport const tracked = 1;\n",
      "untracked.ts": "// Works around #43.\nexport const untracked = 1;\n",
    });

    git(directory, ["init", "--quiet"]);
    git(directory, ["add", "tracked.ts"]);

    expect(runCheck(directory)).toEqual({
      status: 1,
      output:
        'tracked.ts\n  x line 1 cites an issue or pull request number: "#42"\ncheck-comments: 1 files, 1 failures\n',
    });
  });

  test("skips a tracked file that was deleted from the working tree", () => {
    const directory = createWorkspace({
      "gone.ts": "// Works around #42.\nexport const gone = 1;\n",
    });

    git(directory, ["init", "--quiet"]);
    git(directory, ["add", "gone.ts"]);
    rmSync(path.join(directory, "gone.ts"));

    expect(runCheck(directory)).toEqual({
      status: 0,
      output: "check-comments: 0 files, 0 failures\n",
    });
  });
});

describe("check-comments --changed", () => {
  const branchWith = (lines) => {
    const sandbox = createSandbox();

    sandbox.write("README.md", "# Sandbox\n");
    sandbox.git(["add", "."]);
    sandbox.git(["commit", "--quiet", "--message", "chore(repo): 🎉 Start"]);
    sandbox.git(["branch", "origin/main", "HEAD"]);
    sandbox.git(["switch", "--quiet", "--create", "feat/comments"]);
    sandbox.write("src/wide.ts", lines.join("\n"));
    sandbox.git(["add", "."]);
    sandbox.git(["commit", "--quiet", "--message", "feat(app): ✨ Add the module"]);

    return sandbox;
  };

  const code = (count) =>
    Array.from({ length: count }, (_, index) => `export const value${index} = ${index};`);

  const comment = (count) => Array.from({ length: count }, (_, index) => `// Reason ${index}.`);

  const runChanged = (sandbox, base = "origin/main") => {
    const { status, stdout, stderr } = sandbox.run(SCRIPT, ["--changed", base]);

    return { status, output: `${stdout}${stderr}` };
  };

  test("fails a large change that is mostly comment", () => {
    const sandbox = branchWith([...comment(40), ...code(300)]);
    const { status, output } = runChanged(sandbox);

    expect(status).toBe(1);
    expect(output).toContain("12% comment");
  });

  test("passes a large change with few comments", () => {
    const sandbox = branchWith([...comment(5), ...code(300)]);
    const { status, output } = runChanged(sandbox);

    expect(status).toBe(0);
    expect(output).toContain("5 of 305 added lines");
  });

  test("passes a small change however dense, because the share says nothing there", () => {
    const sandbox = branchWith([...comment(10), ...code(10)]);

    expect(runChanged(sandbox).status).toBe(0);
  });

  test("says so and passes when there is no base to fork from", () => {
    const sandbox = branchWith(code(1));
    const { status, output } = runChanged(sandbox, "origin/nowhere");

    expect(status).toBe(0);
    expect(output).toContain("origin/nowhere");
  });
});
