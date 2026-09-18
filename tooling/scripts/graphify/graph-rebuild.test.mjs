import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { createSandbox } from "../git-sandbox.mjs";
import { statePaths } from "./graph-lock.mjs";
import { findExecutable } from "./graph-rules.mjs";

const SCRIPT = fileURLToPath(new URL("graph-rebuild.mjs", import.meta.url));

const UPDATE = "update . --force --no-description --no-label";

const EXPORT = "export obsidian";

// Logs each call with its process id, and how many git variables reached it.
const FAKE_GRAPHIFY = [
  "#!/bin/sh",
  'printf "start %s %s\\n" "$$" "$*" >> "$GRAPHIFY_CALLS"',
  'printf "git-variables %s\\n" "$(env | grep -c "^GIT_")" >> "$GRAPHIFY_CALLS"',
  'sleep "${GRAPHIFY_SECONDS:-0}"',
  'printf "end %s %s\\n" "$$" "$*" >> "$GRAPHIFY_CALLS"',
  'exit "${GRAPHIFY_STATUS:-0}"',
].join("\n");

const WAIT_STEP_MS = 50;

const IDLE_TIMEOUT_MS = 20_000;

// Room for a few fake rebuilds of a second or two each, well past the idle wait.
const TEST_TIMEOUT_MS = 30_000;

const pause = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const pathWithoutGraphify = (searchPath) =>
  searchPath
    .split(path.delimiter)
    .filter((directory) => findExecutable("graphify", { PATH: directory }) === undefined)
    .join(path.delimiter);

const createProject = ({ hasGraphify = true } = {}) => {
  const sandbox = createSandbox();
  const calls = path.join(sandbox.root, "graphify-calls.log");
  const state = statePaths(sandbox.directory);

  sandbox.env.GRAPHIFY_CALLS = calls;
  sandbox.env.PATH = pathWithoutGraphify(sandbox.env.PATH);

  if (hasGraphify) sandbox.fakeCommand("graphify", FAKE_GRAPHIFY);

  const readCalls = () => (existsSync(calls) ? readFileSync(calls, "utf8").split("\n") : []);
  const started = (verb) =>
    readCalls()
      .filter((line) => line.startsWith(`${verb} `))
      .map((line) => line.split(" ").slice(2).join(" "));
  const hook = (name, args = [], env = {}) => sandbox.run(SCRIPT, [name, ...args], env);
  const manual = (env = {}) => sandbox.run(SCRIPT, [], env);

  // Idle: no rebuild holds the lock and no request waits for one.
  const waitUntilIdle = async () => {
    const deadline = Date.now() + IDLE_TIMEOUT_MS;

    while (existsSync(state.lock) || existsSync(state.request)) {
      if (Date.now() > deadline) throw new Error("the rebuild did not finish in time");

      await pause(WAIT_STEP_MS);
    }
  };

  return { hook, manual, readCalls, sandbox, started, state, waitUntilIdle };
};

const peakConcurrency = (lines) => {
  let running = 0;
  let peak = 0;

  for (const line of lines) {
    if (line.startsWith("start ")) running += 1;
    if (line.startsWith("end ")) running -= 1;

    peak = Math.max(peak, running);
  }

  return peak;
};

const timed = (run) => {
  const startedAt = performance.now();
  const result = run();

  return { ...result, elapsedMs: performance.now() - startedAt };
};

describe("graph-rebuild from a git hook", { timeout: TEST_TIMEOUT_MS }, () => {
  test("does nothing, silently, when graphify is not installed", () => {
    const { hook, state } = createProject({ hasGraphify: false });
    const { status, stderr, stdout } = hook("post-commit");

    expect(status).toBe(0);
    expect(stdout).toBe("");
    expect(stderr).toBe("");
    expect(existsSync(state.directory)).toBe(false);
  });

  test("ignores a file checkout", () => {
    const { hook, state } = createProject();

    expect(hook("post-checkout", ["a", "b", "0"]).status).toBe(0);
    expect(existsSync(state.directory)).toBe(false);
  });

  test("rebuilds the graph, then exports the notes, without the hook's git variables", async () => {
    const { hook, readCalls, started, waitUntilIdle } = createProject();
    const { status, stdout } = hook("post-commit", [], { GIT_INDEX_FILE: "/missing/index" });

    expect(status).toBe(0);
    expect(stdout).toBe("");

    await waitUntilIdle();

    expect(started("start")).toEqual([UPDATE, EXPORT]);
    expect(readCalls().filter((line) => line.startsWith("git-variables"))).toEqual([
      "git-variables 0",
      "git-variables 0",
    ]);
  });

  test("returns before the rebuild ends", async () => {
    const { hook, started, waitUntilIdle } = createProject();
    const { elapsedMs, status } = timed(() =>
      hook("post-checkout", ["a", "b", "1"], { GRAPHIFY_SECONDS: "2" }),
    );

    expect(status).toBe(0);
    expect(elapsedMs).toBeLessThan(1000);

    await waitUntilIdle();

    expect(started("end")).toEqual([UPDATE, EXPORT]);
  });
});

describe("graph-rebuild when rebuilds overlap", { timeout: TEST_TIMEOUT_MS }, () => {
  test("runs one rebuild at a time and folds the triggers that arrive meanwhile", async () => {
    const { hook, readCalls, started, waitUntilIdle } = createProject();
    const env = { GRAPHIFY_SECONDS: "1" };

    hook("post-merge", ["0"], env);
    hook("post-merge", ["0"], env);
    hook("post-rewrite", ["rebase"], env);

    await waitUntilIdle();

    const updates = started("start").filter((step) => step === UPDATE);

    expect(peakConcurrency(readCalls())).toBe(1);
    expect(updates.length).toBeGreaterThanOrEqual(1);
    expect(updates.length).toBeLessThanOrEqual(2);
  });

  test("takes over the lock of a rebuild whose process is gone", async () => {
    const { hook, started, state, waitUntilIdle } = createProject();
    const gone = spawnSync(process.execPath, ["--eval", ""]).pid;

    mkdirSync(state.directory, { recursive: true });
    writeFileSync(state.lock, `${gone}\n`);
    hook("post-commit");

    await waitUntilIdle();

    expect(started("end")).toEqual([UPDATE, EXPORT]);
  });

  test("leaves its request to a rebuild that is running", async () => {
    const { hook, readCalls, state } = createProject();

    mkdirSync(state.directory, { recursive: true });
    writeFileSync(state.lock, `${process.pid}\n`);

    expect(hook("post-commit").status).toBe(0);

    await pause(500);

    expect(readCalls()).toEqual([]);
    expect(existsSync(state.request)).toBe(true);
  });

  test("stops after a failing step and logs its exit code, still returning 0", async () => {
    const { hook, started, state, waitUntilIdle } = createProject();

    expect(hook("post-commit", [], { GRAPHIFY_STATUS: "3" }).status).toBe(0);

    await waitUntilIdle();

    expect(started("start")).toEqual([UPDATE]);
    expect(readFileSync(state.log, "utf8")).toMatch(/\] exit 3\n$/u);
  });
});

describe("graph-rebuild by hand", () => {
  test("says how to install graphify when it is missing", () => {
    const { manual } = createProject({ hasGraphify: false });
    const { status, stderr } = manual();

    expect(status).toBe(1);
    expect(stderr).toContain("npm install -g @sentropic/graphify");
  });

  test("rebuilds in the foreground and prints each step", () => {
    const { manual, started } = createProject();
    const { status, stdout } = manual();

    expect(status).toBe(0);
    expect(stdout).toBe(
      `graph: graphify ${UPDATE}\ngraph: exit 0\ngraph: graphify ${EXPORT}\ngraph: exit 0\n`,
    );
    expect(started("end")).toEqual([UPDATE, EXPORT]);
  });

  test("fails when graphify fails", () => {
    const { manual } = createProject();

    expect(manual({ GRAPHIFY_STATUS: "3" }).status).toBe(1);
  });

  test("leaves its request to a rebuild that is running", () => {
    const { manual, readCalls, state } = createProject();

    mkdirSync(state.directory, { recursive: true });
    writeFileSync(state.lock, `${process.pid}\n`);

    const { status, stdout } = manual();

    expect(status).toBe(0);
    expect(stdout).toContain(`process ${process.pid} is rebuilding`);
    expect(readCalls()).toEqual([]);
  });
});
