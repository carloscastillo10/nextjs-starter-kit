import { accessSync, constants, statSync } from "node:fs";
import path from "node:path";

export const GRAPHIFY = "graphify";

/*
 * graphify refuses to write a graph with fewer nodes than the last one, and with no API key
 * it leaves descriptions and labels as instructions for an assistant a git hook does not have.
 */
export const REBUILD_STEPS = [
  ["update", ".", "--force", "--no-description", "--no-label"],
  ["export", "obsidian"],
];

// post-checkout also fires for a file checkout, and an amend rewrites after post-commit.
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

// Git exports GIT_INDEX_FILE and friends to its hooks, and graphify runs git of its own.
export const withoutGitVariables = (env) =>
  Object.fromEntries(Object.entries(env).filter(([key]) => !key.startsWith("GIT_")));
