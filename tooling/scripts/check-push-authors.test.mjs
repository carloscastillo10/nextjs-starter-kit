import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "./git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("check-push-authors.mjs", import.meta.url));

const TEAMMATE = { GIT_AUTHOR_NAME: "Grace Hopper", GIT_AUTHOR_EMAIL: "grace@example.com" };

const STRANGER = { GIT_AUTHOR_NAME: "Unknown", GIT_AUTHOR_EMAIL: "stranger@example.com" };

const sandboxWithPublishedMain = () => {
  const sandbox = createSandbox();

  sandbox.addOrigin();
  sandbox.commit("First commit", { env: TEAMMATE });
  sandbox.git(["push", "--quiet", "origin", "main"]);
  sandbox.git(["switch", "--quiet", "--create", "feat/settings-page"]);

  return sandbox;
};

describe("check-push-authors", () => {
  test("refuses a commit by an address the repository has never seen", () => {
    const sandbox = sandboxWithPublishedMain();

    sandbox.commit("Foreign commit", { env: STRANGER });

    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(1);
    expect(stderr).toContain("stranger@example.com");
    expect(stderr).toContain("Foreign commit");
    expect(stderr).toContain("git rebase --no-ff origin/main --exec");
  });

  test("accepts the first commit of a new colleague, who pushes as themselves", () => {
    const sandbox = sandboxWithPublishedMain();

    sandbox.commit("Own commit");

    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stderr).toContain("1 commits, every author is known");
  });

  test("accepts commits by an address already on origin/main", () => {
    const sandbox = sandboxWithPublishedMain();

    sandbox.commit("Teammate commit", { env: TEAMMATE });
    sandbox.commit("Another teammate commit", { env: TEAMMATE });

    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stderr).toContain("2 commits, every author is known");
  });

  test("says so when the branch adds nothing", () => {
    const sandbox = sandboxWithPublishedMain();
    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stderr).toContain("nothing added against origin/main");
  });

  test("skips itself when origin/main has not been fetched", () => {
    const sandbox = createSandbox();

    sandbox.commit("Local only", { env: STRANGER });

    const { status, stderr } = sandbox.run(SCRIPT);

    expect(status).toBe(0);
    expect(stderr).toContain("origin/main is not fetched, skipped");
  });
});
