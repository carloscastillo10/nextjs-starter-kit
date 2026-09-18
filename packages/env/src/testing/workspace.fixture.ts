import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const fixtureRoot = (): string => {
  const root = mkdtempSync(join(tmpdir(), "env-root-"));

  writeFileSync(join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n");

  return root;
};

export const orphanDirectory = (): string => mkdtempSync(join(tmpdir(), "env-orphan-"));
