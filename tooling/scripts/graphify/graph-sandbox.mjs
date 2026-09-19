import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createSandbox } from "../git/git-sandbox.mjs";
import { statePaths } from "./graph-lock.mjs";
import { findExecutable } from "./graph-rules.mjs";

export const SCRIPT = fileURLToPath(new URL("graph-rebuild.mjs", import.meta.url));

export const UPDATE = "update . --force --no-description --no-label";

export const EXPORT = "export obsidian";

// Room for a few fake rebuilds of a second or two each, well past the idle wait.
export const TEST_TIMEOUT_MS = 30_000;

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

export const pause = (milliseconds) =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

export const timed = (run) => {
  const startedAt = performance.now();
  const result = run();

  return { ...result, elapsedMs: performance.now() - startedAt };
};

const pathWithoutGraphify = (searchPath) =>
  searchPath
    .split(path.delimiter)
    .filter((directory) => findExecutable("graphify", { PATH: directory }) === undefined)
    .join(path.delimiter);

/*
 * A git sandbox whose PATH has no real graphify, only, when asked for, a fake one that
 * logs its calls and whose duration and exit code the environment sets.
 */
export const createGraphProject = ({ hasGraphify = true } = {}) => {
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
