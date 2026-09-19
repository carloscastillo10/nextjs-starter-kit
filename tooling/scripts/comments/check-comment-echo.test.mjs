import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "../git/git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("check-comment-echo.mjs", import.meta.url));

const SENTENCE = "the provider drops the first request after every deploy of the service";

const ECHOED = SENTENCE.split(" ").slice(0, 8).join(" ");

const createBranch = () => {
  const sandbox = createSandbox();

  sandbox.write("README.md", "# Sandbox\n");
  sandbox.git(["add", "."]);
  sandbox.git(["commit", "--quiet", "--message", "chore(repo): 🎉 Start"]);
  sandbox.git(["branch", "origin/main", "HEAD"]);
  sandbox.git(["switch", "--quiet", "--create", "feat/echo"]);

  return sandbox;
};

const commitAll = (sandbox) => {
  sandbox.git(["add", "."]);
  sandbox.git(["commit", "--quiet", "--message", "feat(app): ✨ Add the retry"]);
};

const runCheck = (sandbox, args = []) => {
  const { status, stdout, stderr } = sandbox.run(SCRIPT, args);

  return { status, output: `${stdout}${stderr}` };
};

describe("check-comment-echo", () => {
  test("fails a branch whose comment repeats prose the same branch writes", () => {
    const sandbox = createBranch();

    sandbox.write("docs/provider.md", `${SENTENCE}.\n`);
    sandbox.write("src/retry.ts", `// ${SENTENCE}\nexport const retries = 2;\n`);
    commitAll(sandbox);

    const { status, output } = runCheck(sandbox, ["origin/main"]);

    expect(status).toBe(1);
    expect(output).toContain("src/retry.ts");
    expect(output).toContain(ECHOED);
  });

  test("passes a branch whose comment says something the documents do not", () => {
    const sandbox = createBranch();

    sandbox.write("docs/provider.md", "The provider is rate limited to ten calls a second.\n");
    sandbox.write("src/retry.ts", `// ${SENTENCE}\nexport const retries = 2;\n`);
    commitAll(sandbox);

    const { status, output } = runCheck(sandbox, ["origin/main"]);

    expect(status).toBe(0);
    expect(output).toContain("check-comment-echo");
  });

  test("passes when the comment is gone from the working tree", () => {
    const sandbox = createBranch();

    sandbox.write("docs/provider.md", `${SENTENCE}.\n`);
    sandbox.write("src/retry.ts", `// ${SENTENCE}\nexport const retries = 2;\n`);
    commitAll(sandbox);
    sandbox.write("src/retry.ts", "export const retries = 2;\n");

    expect(runCheck(sandbox, ["origin/main"]).status).toBe(0);
  });

  test("says so and passes when there is no base to fork from", () => {
    const sandbox = createBranch();

    const { status, output } = runCheck(sandbox, ["origin/nowhere"]);

    expect(status).toBe(0);
    expect(output).toContain("origin/nowhere");
  });

  test("uses origin/main when no base is named", () => {
    const sandbox = createBranch();

    sandbox.write("docs/provider.md", `${SENTENCE}.\n`);
    sandbox.write("src/retry.ts", `// ${SENTENCE}\nexport const retries = 2;\n`);
    commitAll(sandbox);

    expect(runCheck(sandbox).status).toBe(1);
  });
});
