import { execFileSync, spawn } from "node:child_process";
import { closeSync, openSync, writeSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  acquireLock,
  activeLockHolder,
  hasRequest,
  HEARTBEAT_MS,
  refreshLock,
  releaseLock,
  requestRebuild,
  statePaths,
  takeRequest,
} from "./graph-lock.mjs";
import {
  findExecutable,
  GRAPHIFY,
  REBUILD_STEPS,
  shouldRebuild,
  withoutGitVariables,
} from "./graph-rules.mjs";

const SCRIPT = fileURLToPath(import.meta.url);

// Long enough for a large repository, short enough that a run that hangs frees the lock.
const STEP_TIMEOUT_MS = 10 * 60_000;

const INSTALL_HINT =
  "graph: graphify is not on your PATH. Install it with `npm install -g @sentropic/graphify`, then run pnpm graph again.\n";

const repositoryRoot = () =>
  execFileSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

const runStep = (graphify, args, output) =>
  new Promise((resolve) => {
    const child = spawn(graphify, args, {
      shell: process.platform === "win32",
      stdio: ["ignore", output, output],
      timeout: STEP_TIMEOUT_MS,
    });

    child.on("error", () => resolve(1));
    child.on("close", (code) => resolve(code ?? 1));
  });

const rebuildOnce = async (graphify, sink) => {
  for (const args of REBUILD_STEPS) {
    sink.note(`graphify ${args.join(" ")}`);

    const code = await runStep(graphify, args, sink.output);

    sink.note(`exit ${code}`);

    if (code !== 0) return code;
  }

  return 0;
};

/*
 * One rebuild per request taken, however many hooks asked while the last one ran.
 * The request is checked again once the lock is gone: a hook that found the lock
 * still held a moment before the release left its request for this process to take.
 */
const drain = async (root, graphify, openSink) => {
  if (!acquireLock(root)) return 0;

  const heartbeat = setInterval(() => refreshLock(root), HEARTBEAT_MS);
  let sink;
  let status = 0;

  try {
    sink = openSink(root);

    while (takeRequest(root)) status = await rebuildOnce(graphify, sink);
  } finally {
    clearInterval(heartbeat);
    sink?.close();
    releaseLock(root);
  }

  return hasRequest(root) ? drain(root, graphify, openSink) : status;
};

const logSink = (root) => {
  const descriptor = openSync(statePaths(root).log, "w");

  return {
    close: () => closeSync(descriptor),
    note: (line) => writeSync(descriptor, `[${new Date().toISOString()}] ${line}\n`),
    output: descriptor,
  };
};

const terminalSink = () => ({
  close: () => undefined,
  note: (line) => process.stdout.write(`graph: ${line}\n`),
  output: "inherit",
});

const worker = async (root) => {
  const graphify = findExecutable(GRAPHIFY);

  return graphify === undefined ? 0 : drain(root, graphify, logSink);
};

/*
 * Runs inside a git hook, so it never fails and never makes git wait: without graphify
 * it does nothing, and otherwise it leaves a request and starts a detached process with
 * no terminal attached, which neither git nor lefthook waits for.
 */
const trigger = (hook, args) => {
  try {
    if (!shouldRebuild(hook, args) || findExecutable(GRAPHIFY) === undefined) return 0;

    const root = repositoryRoot();

    requestRebuild(root);

    if (activeLockHolder(root) !== undefined) return 0;

    const child = spawn(process.execPath, [SCRIPT, "--worker"], {
      cwd: root,
      detached: true,
      env: withoutGitVariables(process.env),
      stdio: "ignore",
      windowsHide: true,
    });

    // Without a listener, a process that cannot start throws out of the hook.
    child.on("error", () => undefined);
    child.unref();
  } catch {
    // The rebuild waits for the next hook; the git command itself goes on.
  }

  return 0;
};

const manual = async () => {
  const graphify = findExecutable(GRAPHIFY);

  if (graphify === undefined) {
    process.stderr.write(INSTALL_HINT);

    return 1;
  }

  const root = repositoryRoot();

  requestRebuild(root);

  const holder = activeLockHolder(root);

  if (holder !== undefined) {
    const log = path.relative(root, statePaths(root).log);

    process.stdout.write(
      `graph: process ${holder} is rebuilding and takes this request next. Its output goes to ${log}.\n`,
    );

    return 0;
  }

  return (await drain(root, graphify, terminalSink)) === 0 ? 0 : 1;
};

const main = (argv) => {
  const [mode, ...args] = argv;

  if (mode === "--worker") return worker(repositoryRoot());
  if (mode === undefined) return manual();

  return trigger(mode, args);
};

process.exitCode = await main(process.argv.slice(2));
