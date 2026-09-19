import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "./git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("fix-staged.mjs", import.meta.url));

const resolvePackage = createRequire(import.meta.url).resolve;

const LOGGING_PNPM = [
  "#!/bin/sh",
  `printf '%s\\n' "$*" >> "$PNPM_LOG"`,
  'exit "${PNPM_STATUS:-0}"',
].join("\n");

const sandboxWithPartlyStagedFile = () => {
  const sandbox = createSandbox();

  sandbox.commit("Start", { files: ["a.ts", "b.ts", "c.ts"] });
  sandbox.write("a.ts", "staged\n");
  sandbox.write("b.ts", "staged\n");
  sandbox.git(["add", "a.ts", "b.ts"]);
  sandbox.write("a.ts", "staged\nnot staged\n");
  sandbox.write("c.ts", "not staged\n");

  return sandbox;
};

const recordOf = (sandbox) => {
  const file = path.join(
    sandbox.directory,
    sandbox.git(["rev-parse", "--git-path", "fix-staged-partial"]),
  );

  return existsSync(file) ? readFileSync(file, "utf8") : null;
};

const runLogged = (sandbox, args, extraEnv = {}) => {
  const log = path.join(sandbox.root, "pnpm.log");

  sandbox.fakeCommand("pnpm", LOGGING_PNPM);

  const result = sandbox.run(SCRIPT, args, { PNPM_LOG: log, ...extraEnv });

  return { ...result, calls: existsSync(log) ? readFileSync(log, "utf8") : "" };
};

describe("fix-staged --record", () => {
  test("records the files that are staged in part", () => {
    const sandbox = sandboxWithPartlyStagedFile();

    expect(sandbox.run(SCRIPT, ["--record"]).status).toBe(0);
    expect(recordOf(sandbox)).toBe("a.ts\n");
  });

  test("clears the record once nothing is staged in part", () => {
    const sandbox = sandboxWithPartlyStagedFile();

    sandbox.run(SCRIPT, ["--record"]);
    sandbox.git(["add", "a.ts"]);
    sandbox.run(SCRIPT, ["--record"]);

    expect(recordOf(sandbox)).toBeNull();
  });
});

describe("fix-staged <tool>", () => {
  test("fixes the fully staged files and only checks the ones staged in part", () => {
    const sandbox = sandboxWithPartlyStagedFile();

    sandbox.run(SCRIPT, ["--record"]);

    const { status, calls, stderr } = runLogged(sandbox, ["prettier", "a.ts", "b.ts"]);

    expect(status).toBe(0);
    expect(calls).toBe(
      "exec prettier --write --ignore-unknown b.ts\nexec prettier --check --ignore-unknown a.ts\n",
    );
    expect(stderr).toContain("a.ts");
  });

  test("runs ESLint with and without --fix the same way", () => {
    const sandbox = sandboxWithPartlyStagedFile();

    sandbox.run(SCRIPT, ["--record"]);

    expect(runLogged(sandbox, ["eslint", "a.ts", "b.ts"]).calls).toBe(
      "exec eslint --fix --max-warnings 0 --no-warn-ignored b.ts\nexec eslint --max-warnings 0 --no-warn-ignored a.ts\n",
    );
  });

  test("fixes every file when nothing was recorded", () => {
    const sandbox = sandboxWithPartlyStagedFile();

    expect(runLogged(sandbox, ["prettier", "a.ts", "b.ts"]).calls).toBe(
      "exec prettier --write --ignore-unknown a.ts b.ts\n",
    );
  });

  test("fails when the tool fails", () => {
    const sandbox = sandboxWithPartlyStagedFile();

    expect(runLogged(sandbox, ["prettier", "b.ts"], { PNPM_STATUS: "1" }).status).toBe(1);
  });

  test("refuses a tool it does not know", () => {
    const sandbox = sandboxWithPartlyStagedFile();
    const { status, stderr } = runLogged(sandbox, ["biome", "b.ts"]);

    expect(status).toBe(2);
    expect(stderr).toContain("eslint, prettier");
  });
});

describe("fix-staged in a lefthook pre-commit", () => {
  const LEFTHOOK = resolvePackage("lefthook/bin/index.js");

  const PRETTIER = resolvePackage("prettier/bin/prettier.cjs");

  const sandboxWithHooks = () => {
    const sandbox = createSandbox();

    sandbox.fakeCommand(
      "pnpm",
      `#!/bin/sh\nshift 2\nexec "${process.execPath}" "${PRETTIER}" "$@"`,
    );
    sandbox.write(
      "lefthook.yml",
      [
        "pre-commit:",
        "  setup:",
        `    - run: node ${SCRIPT} --record`,
        "  jobs:",
        "    - name: prettier",
        `      run: node ${SCRIPT} prettier {staged_files}`,
        "      stage_fixed: true",
      ].join("\n"),
    );
    sandbox.write("a.js", "const a = 1;\n");
    sandbox.write("other.txt", "untouched\n");
    sandbox.git(["add", "."]);
    sandbox.git(["commit", "--quiet", "--no-verify", "--message", "Start"]);
    execFileSync(process.execPath, [LEFTHOOK, "install"], {
      cwd: sandbox.directory,
      env: sandbox.env,
      stdio: "ignore",
    });

    return sandbox;
  };

  const commit = (sandbox) =>
    spawnSync("git", ["commit", "--message", "Work"], {
      cwd: sandbox.directory,
      encoding: "utf8",
      env: sandbox.env,
    }).status;

  const read = (sandbox, file) => readFileSync(path.join(sandbox.directory, file), "utf8");

  test("commits the formatted version of a fully staged file", () => {
    const sandbox = sandboxWithHooks();

    sandbox.write("a.js", "const a   =   1;\n");
    sandbox.git(["add", "a.js"]);

    expect(commit(sandbox)).toBe(0);
    expect(sandbox.git(["show", "HEAD:a.js"])).toBe("const a = 1;");
  });

  test("keeps every unstaged edit when a file staged in part needs formatting", () => {
    const sandbox = sandboxWithHooks();

    sandbox.write("other.txt", "untouched\nnot staged\n");
    sandbox.write("a.js", "const a = 1;\nconst d   =   4;\n");
    sandbox.git(["add", "a.js"]);
    sandbox.write("a.js", "const a = 1;\nconst d   =   44;\n");

    expect(commit(sandbox)).toBe(1);
    expect(read(sandbox, "other.txt")).toBe("untouched\nnot staged\n");
    expect(read(sandbox, "a.js")).toBe("const a = 1;\nconst d   =   44;\n");
    expect(sandbox.git(["show", ":a.js"])).toBe("const a = 1;\nconst d   =   4;");
  });
});
