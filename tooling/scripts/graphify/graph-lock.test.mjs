import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, onTestFinished, test } from "vitest";

import {
  acquireLock,
  activeLockHolder,
  hasRequest,
  isLockStale,
  refreshLock,
  releaseLock,
  requestRebuild,
  STALE_AFTER_MS,
  statePaths,
  takeRequest,
} from "./graph-lock.mjs";

const HOUR_MS = 60 * 60_000;

const createRoot = () => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "graph-lock-")));

  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });

  return root;
};

// The id of a process that already exited.
const finishedPid = () => spawnSync(process.execPath, ["--eval", ""]).pid;

const writeLock = (root, text, ageMs = 0) => {
  const { directory, lock } = statePaths(root);
  const time = new Date(Date.now() - ageMs);

  mkdirSync(directory, { recursive: true });
  writeFileSync(lock, text);
  utimesSync(lock, time, time);
};

const lockText = (root) => readFileSync(statePaths(root).lock, "utf8");

const lockAgeMs = (root) => Date.now() - statSync(statePaths(root).lock).mtimeMs;

describe("statePaths", () => {
  test("keeps the lock, the request and the log in the graphify state folder", () => {
    const root = createRoot();

    expect(statePaths(root)).toEqual({
      directory: path.join(root, ".graphify"),
      lock: path.join(root, ".graphify", ".rebuild.lock"),
      log: path.join(root, ".graphify", "rebuild.log"),
      request: path.join(root, ".graphify", ".rebuild.pending"),
    });
  });
});

describe("the rebuild request", () => {
  test("is there once asked for and gone once taken", () => {
    const root = createRoot();

    expect(hasRequest(root)).toBe(false);

    requestRebuild(root);

    expect(hasRequest(root)).toBe(true);
    expect(takeRequest(root)).toBe(true);
    expect(hasRequest(root)).toBe(false);
    expect(takeRequest(root)).toBe(false);
  });

  test("folds any number of requests into one", () => {
    const root = createRoot();

    requestRebuild(root);
    requestRebuild(root);
    requestRebuild(root);

    expect(takeRequest(root)).toBe(true);
    expect(takeRequest(root)).toBe(false);
  });
});

describe("isLockStale", () => {
  const running = () => true;

  test("keeps a fresh lock of a running process", () => {
    expect(isLockStale({ ageMs: 1000, pid: 4242 }, running)).toBe(false);
  });

  test("drops a lock whose process is gone", () => {
    expect(isLockStale({ ageMs: 1000, pid: 4242 }, () => false)).toBe(true);
  });

  test("drops a lock older than the heartbeat allows, even of a running process", () => {
    expect(isLockStale({ ageMs: STALE_AFTER_MS + 1, pid: 4242 }, running)).toBe(true);
  });

  test("drops a lock with no usable process id", () => {
    expect(isLockStale({ ageMs: 1000, pid: Number.NaN }, running)).toBe(true);
    expect(isLockStale({ ageMs: 1000, pid: 0 }, running)).toBe(true);
    expect(isLockStale({ ageMs: 1000, pid: -1 }, running)).toBe(true);
  });

  test("checks whether the process runs by default", () => {
    expect(isLockStale({ ageMs: 1000, pid: process.pid })).toBe(false);
    expect(isLockStale({ ageMs: 1000, pid: finishedPid() })).toBe(true);
  });
});

describe("taking the lock", () => {
  test("holds the process id on its first line, the format graphify watch reads", () => {
    const root = createRoot();

    expect(acquireLock(root)).toBe(true);
    expect(lockText(root)).toBe(`${process.pid}\n`);
    expect(activeLockHolder(root)).toBe(process.pid);
  });

  test("is not taken twice", () => {
    const root = createRoot();

    expect(acquireLock(root)).toBe(true);
    expect(acquireLock(root)).toBe(false);
  });

  test("is not taken from a running process with a fresh lock", () => {
    const root = createRoot();

    writeLock(root, `${process.ppid}\n`);

    expect(acquireLock(root)).toBe(false);
    expect(activeLockHolder(root)).toBe(process.ppid);
    expect(lockText(root)).toBe(`${process.ppid}\n`);
  });

  test("is taken over from a process that is gone", () => {
    const root = createRoot();

    writeLock(root, `${finishedPid()}\n`);

    expect(activeLockHolder(root)).toBeUndefined();
    expect(acquireLock(root)).toBe(true);
    expect(lockText(root)).toBe(`${process.pid}\n`);
  });

  test("is taken over when it holds no process id", () => {
    const root = createRoot();

    writeLock(root, "not a process\n");

    expect(acquireLock(root)).toBe(true);
    expect(lockText(root)).toBe(`${process.pid}\n`);
  });

  test("is taken over when its heartbeat stopped, whatever process has the id now", () => {
    const root = createRoot();

    writeLock(root, `${process.ppid}\n`, HOUR_MS);

    expect(activeLockHolder(root)).toBeUndefined();
    expect(acquireLock(root)).toBe(true);
  });
});

describe("releasing the lock", () => {
  test("is done only by its owner", () => {
    const root = createRoot();

    writeLock(root, `${process.ppid}\n`);
    releaseLock(root);

    expect(existsSync(statePaths(root).lock)).toBe(true);

    rmSync(statePaths(root).lock);
    acquireLock(root);
    releaseLock(root);

    expect(existsSync(statePaths(root).lock)).toBe(false);
    expect(activeLockHolder(root)).toBeUndefined();
  });

  test("leaves the heartbeat to its owner", () => {
    const root = createRoot();

    writeLock(root, `${process.ppid}\n`, 5 * 60_000);
    refreshLock(root);

    expect(lockAgeMs(root)).toBeGreaterThan(4 * 60_000);

    writeLock(root, `${process.pid}\n`, 5 * 60_000);
    refreshLock(root);

    expect(lockAgeMs(root)).toBeLessThan(60_000);
  });

  test("lets a heartbeat miss a lock that is gone", () => {
    const root = createRoot();

    acquireLock(root);
    rmSync(statePaths(root).lock);

    expect(() => refreshLock(root)).not.toThrow();
  });
});
