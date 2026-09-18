import { existsSync } from "node:fs";
import { join } from "node:path";

import { repoRootOrNull } from "./repo-root";

const DEFAULT_APP_ENV = "dev";

// APP_ENV becomes part of a file name, so only a plain name may pick the file.
const PLAIN_NAME = /^[a-z][a-z0-9-]*$/u;

// An empty APP_ENV counts as unset, the rule every other variable follows too.
export const activeAppEnv = (): string => {
  const name = process.env.APP_ENV;

  return name === undefined || name === "" ? DEFAULT_APP_ENV : name;
};

/*
 * Loads `.env.<APP_ENV>` from the repository root. `process.loadEnvFile` never overwrites a
 * variable that is already set, so the shell and the hosting platform always win and a second
 * call changes nothing. Neither a missing root nor a missing file is an error: on a hosting
 * platform the variables are injected and nothing is read from disk.
 */
export const loadEnvFile = (from: string = process.cwd()): string | null => {
  const root = repoRootOrNull(from);
  const name = activeAppEnv();

  if (root === null || !PLAIN_NAME.test(name)) return null;

  const path = join(root, `.env.${name}`);

  if (!existsSync(path)) return null;

  process.loadEnvFile(path);

  return path;
};
