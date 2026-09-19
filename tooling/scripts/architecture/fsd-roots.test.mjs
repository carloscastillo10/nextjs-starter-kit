import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fsdRoots, readFsdRoots } from "@repo/architecture-config/fsd-roots";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));

const rejects = (roots, reason) =>
  expect(() => readFsdRoots({ roots })).toThrow(new RegExp(reason, "u"));

describe("readFsdRoots", () => {
  it("returns the declared roots", () => {
    expect(readFsdRoots({ roots: ["apps/web/src", "packages/kit/src"] })).toEqual([
      "apps/web/src",
      "packages/kit/src",
    ]);
  });

  it("rejects a document without a list", () => {
    expect(() => readFsdRoots({})).toThrow(/list of FSD roots/u);
  });

  it("rejects an empty list", () => {
    rejects([], "at least one");
  });

  it("rejects a root that is not a string", () => {
    rejects([42], "42");
  });

  it("rejects an absolute path", () => {
    rejects(["/apps/web/src"], "relative to the repository root");
  });

  it("rejects a path that climbs out of the repository", () => {
    rejects(["../other/src"], "relative to the repository root");
  });

  it("rejects a Windows separator", () => {
    rejects(["apps\\web\\src"], "forward slashes");
  });

  it("rejects a trailing slash", () => {
    rejects(["apps/web/src/"], "trailing slash");
  });

  it("rejects a repeated root", () => {
    rejects(["apps/web/src", "apps/web/src"], "listed twice");
  });

  it("rejects a root outside a workspace folder", () => {
    rejects(["src"], "inside apps");
    rejects(["docs/web/src"], "inside apps");
  });
});

describe("fsdRoots", () => {
  it("holds the roots this repository declares", () => {
    expect(fsdRoots.length).toBeGreaterThan(0);
    expect(readFsdRoots({ roots: fsdRoots })).toEqual(fsdRoots);
  });

  it("names folders that exist", () => {
    for (const root of fsdRoots) expect(existsSync(path.join(repositoryRoot, root))).toBe(true);
  });
});
