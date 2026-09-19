import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, onTestFinished, test } from "vitest";

const SCRIPT = fileURLToPath(new URL("remind-skills.mjs", import.meta.url));

const COMPONENT = "apps/web/src/_pages/home/ui/HomePage.tsx";

const createProject = () => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "remind-skills-")));
  const project = path.join(root, "project");
  const temporary = path.join(root, "tmp");

  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });

  mkdirSync(path.join(project, ".git"), { recursive: true });
  mkdirSync(temporary);

  const run = (payload, { cwd = project } = {}) => {
    const { status, stdout, stderr } = spawnSync(process.execPath, [SCRIPT], {
      cwd,
      encoding: "utf8",
      env: { ...process.env, CLAUDE_PROJECT_DIR: project, TMPDIR: temporary },
      input: typeof payload === "string" ? payload : JSON.stringify(payload),
    });

    return { status, stderr, stdout };
  };

  const write = (file, session = "session-a") => ({
    session_id: session,
    cwd: project,
    hook_event_name: "PreToolUse",
    tool_name: "Write",
    tool_input: { file_path: path.isAbsolute(file) ? file : path.join(project, file), content: "" },
  });

  const contextFor = (file, session) => {
    const { status, stdout } = run(write(file, session));

    expect(status).toBe(0);

    if (stdout === "") return undefined;

    const { hookSpecificOutput } = JSON.parse(stdout);

    expect(hookSpecificOutput.hookEventName).toBe("PreToolUse");

    return hookSpecificOutput.additionalContext;
  };

  return { contextFor, project, root, run, temporary, write };
};

describe("remind-skills gives context", () => {
  test("names the skills and the comment rule as context for the write", () => {
    const { contextFor } = createProject();
    const context = contextFor(COMPONENT);

    expect(context).toContain(`You are about to write ${COMPONENT}.`);
    expect(context).toContain("`feature-sliced-design`");
    expect(context).toContain("`vercel-composition-patterns`");
    expect(context).toContain("Comments explain why, never what");
    expect(context).toContain("Each reminder above appears once per session.");
  });

  test("stays silent the second time in a session and speaks again in a new one", () => {
    const { contextFor } = createProject();

    contextFor(COMPONENT);

    expect(contextFor(COMPONENT)).toBeUndefined();
    expect(contextFor(COMPONENT, "session-b")).toContain("`feature-sliced-design`");
  });

  test("brings only what the session has not seen when the next file has another rule", () => {
    const { contextFor } = createProject();

    contextFor(COMPONENT);

    const context = contextFor("apps/web/src/_app/metadata/site-url.ts");

    expect(context).toContain("fetching on the server");
    expect(context).not.toContain("Comments explain why");
  });

  test("gives a document its skill without the comment rule", () => {
    const context = createProject().contextFor("docs/conventions/react.md");

    expect(context).toContain("`stop-slop`");
    expect(context).not.toContain("Comments explain why");
  });

  test("gives a source file no skill rule covers the comment rule alone", () => {
    const context = createProject().contextFor("tooling/eslint/next.js");

    expect(context).toContain("Comments explain why");
    expect(context).not.toContain("Load ");
  });
});

describe("remind-skills stays silent", () => {
  test.each([
    ".github/workflows/ci.yml",
    ".claude/skills/shadcn/SKILL.md",
    "node_modules/pkg/index.js",
  ])("about %s", (file) => {
    expect(createProject().contextFor(file)).toBeUndefined();
  });

  test("about a file outside the project", () => {
    const { contextFor, root } = createProject();

    mkdirSync(path.join(root, "elsewhere", ".git"), { recursive: true });

    expect(contextFor(path.join(root, "elsewhere", COMPONENT))).toBeUndefined();
  });

  test.each([
    ["text that is not JSON", "not json"],
    ["a payload with no file", {}],
    ["a file path that is not a string", { tool_input: { file_path: 42 } }],
  ])("on %s", (_label, payload) => {
    expect(createProject().run(payload)).toEqual({ status: 0, stderr: "", stdout: "" });
  });
});

describe("remind-skills paths and markers", () => {
  test("reads the path from the checkout that holds the file, from any working directory", () => {
    const { project, run, write } = createProject();
    const nested = path.join(project, ".claude", "checkouts", "feature");
    const subdirectory = path.join(project, "apps", "web");

    mkdirSync(nested, { recursive: true });
    mkdirSync(subdirectory, { recursive: true });
    writeFileSync(path.join(nested, ".git"), "");

    const file = path.join(nested, "packages/ui/src/components/card.tsx");
    const { stdout } = run(write(file), { cwd: subdirectory });
    const context = JSON.parse(stdout).hookSpecificOutput.additionalContext;

    expect(context).toContain("You are about to write packages/ui/src/components/card.tsx.");
    expect(context).toContain("`shadcn`");
  });

  test("keeps its markers inside the temporary folder whatever the session id says", () => {
    const { contextFor, root, temporary } = createProject();

    expect(contextFor(COMPONENT, "../../escaped")).toBeDefined();
    expect(readdirSync(root).toSorted()).toEqual(["project", "tmp"]);
    expect(readdirSync(path.join(temporary, "claude-skill-reminders"))).toHaveLength(1);
  });
});
