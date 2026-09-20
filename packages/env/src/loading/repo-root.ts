import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const WORKSPACE_MARKER = "pnpm-workspace.yaml";

export const repoRootOrNull = (from: string = process.cwd()): string | null => {
  let current = resolve(from);

  for (;;) {
    if (existsSync(join(current, WORKSPACE_MARKER))) return current;

    const parent = dirname(current);

    if (parent === current) return null;

    current = parent;
  }
};

export const findRepoRoot = (from: string = process.cwd()): string => {
  const root = repoRootOrNull(from);

  if (root === null) throw new Error(`Could not find ${WORKSPACE_MARKER} above ${from}`);

  return root;
};
