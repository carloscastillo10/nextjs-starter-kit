import { execFileSync, spawnSync } from "node:child_process";
import {
  appendFileSync,
  mkdirSync,
  mkdtempSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { onTestFinished } from "vitest";

const OWNER = { name: "Ada Lovelace", email: "ada@example.com" };

/*
 * Git exports variables such as GIT_INDEX_FILE to the hooks it runs, and these
 * tests run inside the pre-push hook, so a sandbox starts from an environment
 * without them, without the lefthook switches, and with a global config of its own.
 */
const inheritedEnvironment = () =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) => !key.startsWith("GIT_") && !key.startsWith("LEFTHOOK"),
    ),
  );

const globalConfigText = (identity) =>
  [
    "[init]\n\tdefaultBranch = main",
    identity === null ? "" : `[user]\n\tname = ${identity.name}\n\temail = ${identity.email}`,
  ].join("\n");

export const createSandbox = (identity = OWNER) => {
  const root = realpathSync(mkdtempSync(path.join(tmpdir(), "git-sandbox-")));
  const directory = path.join(root, "work");
  const globalConfig = path.join(root, "global.gitconfig");
  const env = {
    ...inheritedEnvironment(),
    GIT_CONFIG_GLOBAL: globalConfig,
    GIT_CONFIG_NOSYSTEM: "1",
  };

  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });

  writeFileSync(globalConfig, `${globalConfigText(identity)}\n`);
  mkdirSync(directory);

  const git = (args, extraEnv = {}) =>
    execFileSync("git", args, {
      cwd: directory,
      encoding: "utf8",
      env: { ...env, ...extraEnv },
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

  const commit = (message, { files = ["notes.txt"], env: extraEnv = {} } = {}) => {
    for (const file of files) {
      mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
      appendFileSync(path.join(directory, file), `${message}\n`);
    }

    git(["add", "--", ...files]);
    git(["commit", "--quiet", "--message", message], extraEnv);
  };

  const addOrigin = () => {
    const origin = path.join(root, "origin.git");

    execFileSync("git", ["init", "--quiet", "--bare", origin], { env });
    git(["remote", "add", "origin", origin]);
  };

  const write = (file, text) => {
    mkdirSync(path.dirname(path.join(directory, file)), { recursive: true });
    writeFileSync(path.join(directory, file), text);
  };

  const fakeCommand = (name, script) => {
    const bin = path.join(root, "bin");

    if (!env.PATH.startsWith(bin)) env.PATH = `${bin}${path.delimiter}${env.PATH}`;

    mkdirSync(bin, { recursive: true });
    writeFileSync(path.join(bin, name), `${script}\n`, { mode: 0o755 });
  };

  const run = (script, args = [], extraEnv = {}) => {
    const { status, stdout, stderr } = spawnSync(process.execPath, [script, ...args], {
      cwd: directory,
      encoding: "utf8",
      env: { ...env, ...extraEnv },
    });

    return { status, stdout, stderr };
  };

  git(["init", "--quiet"]);

  return { addOrigin, commit, directory, env, fakeCommand, git, root, run, write };
};
