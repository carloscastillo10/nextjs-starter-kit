import { accessSync, constants, statSync } from "node:fs";
import path from "node:path";

export const GRAPHIFY = "graphify";

/*
 * graphify refuses to write a graph with fewer nodes than the last one, so without
 * --force a checkout that removes files would leave the old graph in place for good.
 * Descriptions and community labels stay off: with no API key, graphify leaves batches
 * of instructions for an assistant to answer instead, and a git hook has no assistant.
 */
export const REBUILD_STEPS = [
  ["update", ".", "--force", "--no-description", "--no-label"],
  ["export", "obsidian"],
];

/*
 * post-checkout also runs for a file checkout, with 0 as its third argument, and an
 * amend runs post-rewrite right after a post-commit that already asked for a rebuild.
 */
const EVENTS = new Map([
  ["post-commit", () => true],
  ["post-checkout", (args) => args[2] === "1"],
  ["post-merge", () => true],
  ["post-rewrite", (args) => args[0] === "rebase"],
]);

export const shouldRebuild = (hook, args) => EVENTS.get(hook)?.(args) ?? false;

const isExecutableFile = (file) => {
  try {
    accessSync(file, constants.X_OK);

    return statSync(file).isFile();
  } catch {
    return false;
  }
};

export const findExecutable = (name, env = process.env, platform = process.platform) => {
  const extensions = platform === "win32" ? (env.PATHEXT ?? ".EXE;.CMD").split(";") : [""];
  const directories = (env.PATH ?? "").split(path.delimiter).filter(Boolean);

  return directories
    .flatMap((directory) =>
      extensions.map((extension) => path.join(directory, `${name}${extension}`)),
    )
    .find((file) => isExecutableFile(file));
};

/*
 * Git exports variables such as GIT_INDEX_FILE to the hooks it runs, and graphify runs
 * git to read the history, so the rebuild starts from an environment without them.
 */
export const withoutGitVariables = (env) =>
  Object.fromEntries(Object.entries(env).filter(([key]) => !key.startsWith("GIT_")));
