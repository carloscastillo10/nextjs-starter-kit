import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "../git/git-sandbox.mjs";

const SCRIPT = fileURLToPath(new URL("guard-bash.mjs", import.meta.url));

const ROOT = fileURLToPath(new URL("../../..", import.meta.url));

const outputFor = (command, { cwd = ROOT, env = process.env } = {}) => {
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    cwd,
    encoding: "utf8",
    env,
    input: JSON.stringify({
      session_id: "guard-bash-test",
      hook_event_name: "PreToolUse",
      tool_name: "Bash",
      tool_input: { command },
    }),
  });

  expect(status).toBe(0);

  return stdout === "" ? undefined : JSON.parse(stdout).hookSpecificOutput;
};

const denialFor = (command, options) => outputFor(command, options)?.permissionDecisionReason;

const contextFor = (command, options) => outputFor(command, options)?.additionalContext;

const onBranch = (branch) => {
  const sandbox = createSandbox();

  sandbox.commit("First");

  if (branch !== "main") sandbox.git(["switch", "--quiet", "--create", branch]);

  return { cwd: sandbox.directory, env: sandbox.env };
};

describe("guard-bash refuses to skip the hooks", () => {
  test.each([
    "git commit --no-verify --message 'wip'",
    "git commit -n --message 'wip'",
    "git push --no-verify",
    "LEFTHOOK=0 git commit --message 'wip'",
    "LEFTHOOK=false git commit --message 'wip'",
    "cd apps/web && git commit --no-verify --message 'wip'",
  ])("blocks %j", (command) => {
    expect(denialFor(command)).toMatch(/hooks/u);
  });

  test("points at the switch that skips one job instead of all of them", () => {
    expect(denialFor("LEFTHOOK=0 git commit --message 'wip'")).toContain("LEFTHOOK_EXCLUDE");
  });

  test("leaves the narrow switch alone", () => {
    expect(outputFor("LEFTHOOK_EXCLUDE=graph git commit --message 'Add it'")).toBeUndefined();
  });

  test("reads the command and not the file it writes", () => {
    const heredoc = "cat <<'NOTES' > notes.md\nNever run git commit --no-verify here.\nNOTES";

    expect(outputFor(heredoc)).toBeUndefined();
  });

  test("blocks the words even inside quotes, because a shell is not parsed here", () => {
    expect(denialFor("git commit --message 'Document --no-verify'")).toMatch(/hooks/u);
  });
});

describe("guard-bash keeps main behind a pull request", () => {
  test.each([
    "git push origin main",
    "git push -u origin main",
    "git push origin HEAD:main",
    "git push origin refs/heads/main",
    "git push origin +main",
    "git push origin feat/12-settings main",
  ])("blocks %j", (command) => {
    expect(denialFor(command)).toContain("pull request");
  });

  test.each([
    "git push origin feat/12-settings",
    "git push --force-with-lease origin fix/31-header",
    "git push origin feat/main-menu",
    "git push origin HEAD:docs/main-readme",
  ])("allows %j", (command) => {
    expect(outputFor(command)).toBeUndefined();
  });

  test("blocks a push with no branch named while main is checked out", () => {
    expect(denialFor("git push", onBranch("main"))).toContain("pull request");
  });

  test.each(["git push origin HEAD", "git push -u origin HEAD", "git push origin @"])(
    "blocks %j while main is checked out",
    (command) => {
      expect(denialFor(command, onBranch("main"))).toContain("pull request");
    },
  );

  test("allows HEAD from a branch of your own", () => {
    expect(outputFor("git push origin HEAD", onBranch("feat/12-settings"))).toBeUndefined();
  });

  test("allows a push with no branch named from a branch of your own", () => {
    expect(outputFor("git push", onBranch("feat/12-settings"))).toBeUndefined();
  });

  test("allows fetching and pulling", () => {
    expect(outputFor("git fetch origin main", onBranch("main"))).toBeUndefined();
  });
});

describe("guard-bash hands the pull request rules over", () => {
  test("names the sections of the template and the title rule", () => {
    const context = contextFor('gh pr create --base main --title "feat(web): ✨ Add it"');

    expect(context).toContain("## 🎯 What this changes");
    expect(context).toContain("## 🧠 What this branch learned");
    expect(context).toContain("type(scope): <gitmoji> Message");
    expect(context).toContain("Write the body to a file");
  });

  test("assumes the template was read when the body comes from a file", () => {
    const context = contextFor("gh pr create --base main --body-file /tmp/body.md");

    expect(context).toContain("follow its headings");
    expect(context).not.toContain("Write the body to a file");
  });

  test("carries what the branch turns out to be about, while splitting it is still cheap", () => {
    const sandbox = createSandbox();

    sandbox.commit("First");
    sandbox.git(["switch", "--quiet", "--create", "feat/12-everything"]);
    sandbox.commit("Second", {
      files: Array.from({ length: 41 }, (unused, index) => `apps/web/src/shared/lib/${index}.ts`),
    });

    const context = contextFor("gh pr create --base main", {
      cwd: sandbox.directory,
      env: sandbox.env,
    });

    expect(context).toContain("41 files");
    expect(context).toContain("Split it now if it should be split");
  });

  test("says nothing about a pull request that is only being read", () => {
    expect(outputFor("gh pr view 12 --json body")).toBeUndefined();
  });
});

describe("guard-bash stays out of the way of everything else", () => {
  test.each([
    "pnpm gates",
    "git commit --message 'feat(web): ✨ Add the settings page'",
    "gh issue develop 12 --name feat/12-settings --base main --checkout",
  ])("says nothing about %j", (command) => {
    expect(outputFor(command)).toBeUndefined();
  });

  test("says nothing about a tool that is not Bash", () => {
    const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
      encoding: "utf8",
      input: JSON.stringify({ tool_name: "Write", tool_input: { file_path: "README.md" } }),
    });

    expect(status).toBe(0);
    expect(stdout).toBe("");
  });

  test("says nothing when the payload is not JSON", () => {
    const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
      encoding: "utf8",
      input: "not json",
    });

    expect(status).toBe(0);
    expect(stdout).toBe("");
  });
});
