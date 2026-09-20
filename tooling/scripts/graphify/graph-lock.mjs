import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

/*
 * The lock is the one graphify watch takes around its own rebuilds, in its format: the
 * owner's process id on the first line. Sharing it is what keeps the two from overlapping.
 */
export const statePaths = (root) => {
  const directory = path.join(root, ".graphify");

  return {
    directory,
    lock: path.join(directory, ".rebuild.lock"),
    log: path.join(directory, "rebuild.log"),
    request: path.join(directory, ".rebuild.pending"),
  };
};

export const HEARTBEAT_MS = 30_000;

// A rebuild touches its lock every HEARTBEAT_MS, so only a dead owner's lock gets old.
export const STALE_AFTER_MS = 10 * 60_000;

export const isProcessRunning = (pid) => {
  try {
    process.kill(pid, 0);

    return true;
  } catch (error) {
    return error.code === "EPERM";
  }
};

export const isLockStale = ({ ageMs, pid }, isRunning = isProcessRunning) =>
  !Number.isInteger(pid) || pid <= 0 || ageMs > STALE_AFTER_MS || !isRunning(pid);

const readHolder = (lock) => {
  try {
    const text = readFileSync(lock, "utf8");

    return {
      ageMs: Date.now() - statSync(lock).mtimeMs,
      pid: Number.parseInt(text.trim().split(/\s+/u)[0], 10),
      text,
    };
  } catch (error) {
    if (error.code === "ENOENT") return undefined;

    throw error;
  }
};

const createLock = (lock) => {
  try {
    writeFileSync(lock, `${process.pid}\n`, { flag: "wx" });

    return true;
  } catch (error) {
    if (error.code === "EEXIST") return false;

    throw error;
  }
};

// Another process may replace a stale lock between the read and the removal.
const removeIfUnchanged = (lock, holder) => {
  if (readHolder(lock)?.text === holder.text) rmSync(lock, { force: true });
};

export const acquireLock = (root) => {
  const { directory, lock } = statePaths(root);

  mkdirSync(directory, { recursive: true });

  if (createLock(lock)) return true;

  const holder = readHolder(lock);

  if (holder !== undefined && !isLockStale(holder)) return false;
  if (holder !== undefined) removeIfUnchanged(lock, holder);

  return createLock(lock);
};

export const activeLockHolder = (root) => {
  const holder = readHolder(statePaths(root).lock);

  return holder === undefined || isLockStale(holder) ? undefined : holder.pid;
};

const ownsLock = (lock) => readHolder(lock)?.pid === process.pid;

export const refreshLock = (root) => {
  const { lock } = statePaths(root);

  try {
    if (ownsLock(lock)) utimesSync(lock, new Date(), new Date());
  } catch {
    // A missed heartbeat is harmless: the next one comes before the lock can get old.
  }
};

export const releaseLock = (root) => {
  const { lock } = statePaths(root);

  if (ownsLock(lock)) rmSync(lock, { force: true });
};

export const requestRebuild = (root) => {
  const { directory, request } = statePaths(root);

  mkdirSync(directory, { recursive: true });
  writeFileSync(request, "");
};

export const hasRequest = (root) => existsSync(statePaths(root).request);

export const takeRequest = (root) => {
  try {
    rmSync(statePaths(root).request);

    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;

    throw error;
  }
};
