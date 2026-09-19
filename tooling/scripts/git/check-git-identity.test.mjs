import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "./git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("check-git-identity.mjs", import.meta.url));

describe("check-git-identity", () => {
  test("passes silently when the commit would carry the global identity", () => {
    const sandbox = createSandbox();

    expect(sandbox.run(SCRIPT)).toEqual({ status: 0, stdout: "", stderr: "" });
  });

  test("refuses an identity set in the environment and says where it comes from", () => {
    const sandbox = createSandbox();
    const { status, stderr } = sandbox.run(SCRIPT, [], { GIT_AUTHOR_EMAIL: "bot@example.com" });

    expect(status).toBe(1);
    expect(stderr).toContain("author    Ada Lovelace <bot@example.com>");
    expect(stderr).toContain("expected  Ada Lovelace <ada@example.com>");
    expect(stderr).toContain("unset GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL");
  });

  test("refuses an identity passed with git -c and names the command line", () => {
    const sandbox = createSandbox();
    const { status, stderr } = sandbox.run(SCRIPT, [], {
      GIT_CONFIG_PARAMETERS: "'user.email'='bot@example.com'",
    });

    expect(status).toBe(1);
    expect(stderr).toContain("committer Ada Lovelace <bot@example.com>");
    expect(stderr).toContain("git -c user.email=");
    expect(stderr).not.toContain("unset GIT_AUTHOR_NAME");
  });

  test("refuses a repository override and prints how to clear only what is set", () => {
    const sandbox = createSandbox();

    sandbox.git(["config", "--local", "user.email", "bot@example.com"]);

    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(1);
    expect(stderr).toContain("committer Ada Lovelace <bot@example.com>");
    expect(stderr).toContain("git config --local --unset-all user.email");
    expect(stderr).not.toContain("--unset-all user.name");
    expect(stderr).not.toContain("--worktree");
  });

  test("skips itself when there is no global identity to compare against", () => {
    const sandbox = createSandbox(null);
    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stderr).toContain("no global git identity to compare against, skipped");
  });
});
