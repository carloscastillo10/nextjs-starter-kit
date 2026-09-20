import { existsSync } from "node:fs";
import { join } from "node:path";

import { repoRootOrNull } from "./repo-root";

const DEFAULT_APP_ENV = "dev";

const PLAIN_NAME = /^[a-z][a-z0-9-]*$/u;

export const activeAppEnv = (): string => {
  const name = process.env.APP_ENV;

  return name === undefined || name === "" ? DEFAULT_APP_ENV : name;
};

export const loadEnvFile = (from: string = process.cwd()): string | null => {
  const root = repoRootOrNull(from);
  const name = activeAppEnv();

  if (root === null || !PLAIN_NAME.test(name)) return null;

  const path = join(root, `.env.${name}`);

  if (!existsSync(path)) return null;

  process.loadEnvFile(path);

  return path;
};
