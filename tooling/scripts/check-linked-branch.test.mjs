import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "./git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("check-linked-branch.mjs", import.meta.url));

const answeringGh = (linkedBranches) =>
  [
    "#!/bin/sh",
    'if [ "$1 $2" = "repo view" ]; then echo "owner/demo"; exit 0; fi',
    `if [ "$1 $2" = "api graphql" ]; then echo '{"data":{"repository":{"issue":{"linkedBranches":{"totalCount":${linkedBranches}}}}}}'; exit 0; fi`,
    "exit 1",
  ].join("\n");

const withFakeGh = (sandbox, script) => {
  const bin = path.join(sandbox.root, "bin");

  mkdirSync(bin);
  writeFileSync(path.join(bin, "gh"), `${script}\n`, { mode: 0o755 });

  return { PATH: `${bin}${path.delimiter}${process.env.PATH}` };
};

const sandboxOnBranch = (branch, { withOrigin = true } = {}) => {
  const sandbox = createSandbox();

  if (withOrigin) sandbox.addOrigin();

  sandbox.commit("Start");
  sandbox.git(["switch", "--quiet", "--create", branch]);
  sandbox.commit("Work");

  return sandbox;
};

describe("check-linked-branch", () => {
  test("stays silent on a branch that names no issue", () => {
    const sandbox = sandboxOnBranch("chore/tidy-scripts");

    expect(sandbox.run(SCRIPT, [], withFakeGh(sandbox, answeringGh(0)))).toEqual({
      status: 0,
      stdout: "",
      stderr: "",
    });
  });

  test("stops the first push of an issue branch that GitHub has not linked", () => {
    const sandbox = sandboxOnBranch("feat/12-settings-page");
    const { status, stderr } = sandbox.run(SCRIPT, [], withFakeGh(sandbox, answeringGh(0)));

    expect(status).toBe(1);
    expect(stderr).toContain("#12 has no linked branch");
    expect(stderr).toContain(
      "gh issue develop 12 --name feat/12-settings-page --base main --checkout",
    );
  });

  test("passes when the issue already has a linked branch", () => {
    const sandbox = sandboxOnBranch("feat/12-settings-page");
    const { status, stdout } = sandbox.run(SCRIPT, [], withFakeGh(sandbox, answeringGh(1)));

    expect(status).toBe(0);
    expect(stdout).toContain("#12 already has a linked branch");
  });

  test("passes a branch the remote already has, without asking GitHub", () => {
    const sandbox = sandboxOnBranch("feat/12-settings-page");

    sandbox.git(["push", "--quiet", "origin", "feat/12-settings-page"]);

    expect(sandbox.run(SCRIPT, [], withFakeGh(sandbox, answeringGh(0))).status).toBe(0);
  });

  test("does not block a push when GitHub cannot be asked", () => {
    const sandbox = sandboxOnBranch("feat/12-settings-page");
    const { status, stderr } = sandbox.run(SCRIPT, [], withFakeGh(sandbox, "#!/bin/sh\nexit 1"));

    expect(status).toBe(0);
    expect(stderr).toContain("could not ask GitHub about #12");
  });

  test("does not block a repository without a remote", () => {
    const sandbox = sandboxOnBranch("feat/12-settings-page", { withOrigin: false });

    expect(sandbox.run(SCRIPT, [], withFakeGh(sandbox, answeringGh(0))).status).toBe(0);
  });
});
