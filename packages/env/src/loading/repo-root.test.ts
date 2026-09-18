import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { fixtureRoot, orphanDirectory } from "../testing/workspace.fixture";
import { findRepoRoot, repoRootOrNull } from "./repo-root";

describe("findRepoRoot", () => {
  it("walks up from a nested workspace folder", () => {
    const root = fixtureRoot();
    const nested = join(root, "packages", "env", "src");

    mkdirSync(nested, { recursive: true });

    expect(findRepoRoot(nested)).toBe(root);
  });

  it("throws when no workspace manifest sits above the folder", () => {
    expect(() => findRepoRoot(orphanDirectory())).toThrow(/pnpm-workspace\.yaml/u);
  });
});

describe("repoRootOrNull", () => {
  it("returns null when no workspace manifest sits above the folder", () => {
    expect(repoRootOrNull(orphanDirectory())).toBeNull();
  });
});
