import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, onTestFinished, test } from "vitest";

const SCRIPT = fileURLToPath(new URL("graph-hint.mjs", import.meta.url));

const createProject = ({ hasGraph = true } = {}) => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "graph-hint-")));
  const project = path.join(root, "project");
  const temporary = path.join(root, "tmp");

  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });

  mkdirSync(path.join(project, ".git"), { recursive: true });
  mkdirSync(path.join(project, "apps", "web"), { recursive: true });
  mkdirSync(temporary);

  if (hasGraph) {
    mkdirSync(path.join(project, ".graphify"));
    writeFileSync(path.join(project, ".graphify", "GRAPH_REPORT.md"), "# Graph Report\n");
  }

  const run = (input) =>
    spawnSync(process.execPath, [SCRIPT], {
      cwd: project,
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: project, TMPDIR: temporary },
      input,
    });

  const hintFor = (tool, toolInput, { cwd = project, session = "session-a" } = {}) => {
    const { status, stdout } = run(
      JSON.stringify({
        cwd,
        hook_event_name: "PreToolUse",
        session_id: session,
        tool_input: toolInput,
        tool_name: tool,
      }),
    );

    expect(status).toBe(0);

    if (stdout === "") return undefined;

    const { hookSpecificOutput } = JSON.parse(stdout);

    expect(hookSpecificOutput.hookEventName).toBe("PreToolUse");

    return hookSpecificOutput.additionalContext;
  };

  const bash = (command, options) => hintFor("Bash", { command }, options);

  return { bash, hintFor, project, run };
};

describe("graph-hint points a search at the graph", () => {
  test("names the report and the graphify commands", () => {
    const { bash } = createProject();
    const hint = bash("grep -rn createSandbox tooling");

    expect(hint).toContain(".graphify/GRAPH_REPORT.md");
    expect(hint).toContain('graphify query "<question>"');
    expect(hint).toContain("once per session");
  });

  test.each([
    "rg --files-with-matches useTheme apps",
    'find . -name "*.test.mjs"',
    "git grep -n statePaths",
    "fd graph tooling",
    "ls tooling/scripts | grep graph",
    "cd apps/web && rg metadata",
    "git ls-files | xargs grep -l TODO",
    "egrep -r 'a|b' docs",
  ])("counts `%s` as a search", (command) => {
    const { bash } = createProject();

    expect(bash(command)).toBeDefined();
  });

  test.each(["Grep", "Glob"])("counts the %s tool as a search", (tool) => {
    const { hintFor } = createProject();

    expect(hintFor(tool, { pattern: "statePaths" })).toBeDefined();
  });

  test("finds the checkout from a folder inside it", () => {
    const { bash, project } = createProject();

    expect(bash("rg metadata", { cwd: path.join(project, "apps", "web") })).toBeDefined();
  });
});

describe("graph-hint stays silent", () => {
  test.each([
    "pnpm test",
    "git log --grep=graph",
    'echo "grep the logs later"',
    "node tooling/scripts/find-unused.mjs",
    "findings=$(cat report.txt)",
    "echo grep the report instead",
    "ls tooling | rg-wrapper graph",
  ])("for `%s`, which is not a search", (command) => {
    const { bash } = createProject();

    expect(bash(command)).toBeUndefined();
  });

  test("for a tool that reads rather than searches", () => {
    const { hintFor, project } = createProject();

    expect(hintFor("Read", { file_path: path.join(project, "package.json") })).toBeUndefined();
  });

  test("when the graph has not been built", () => {
    const { bash } = createProject({ hasGraph: false });

    expect(bash("grep -rn x .")).toBeUndefined();
  });

  test("the second time in a session, and speaks again in a new one", () => {
    const { bash } = createProject();

    expect(bash("grep -rn x .")).toBeDefined();
    expect(bash("rg y")).toBeUndefined();
    expect(bash("rg y", { session: "session-b" })).toBeDefined();
  });

  test("on a payload it cannot read", () => {
    const { run } = createProject();
    const { status, stdout } = run("not json");

    expect(status).toBe(0);
    expect(stdout).toBe("");
  });
});
