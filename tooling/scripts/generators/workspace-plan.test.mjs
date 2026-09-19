import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { isWorkspaceName, planWorkspace, WORKSPACE_KINDS } from "./workspace-plan.mjs";

const generatorRoot = fileURLToPath(new URL("../../../turbo/generators/", import.meta.url));

const answers = { kind: "packages", name: "metrics", summary: "Counters.", layers: false };

const plan = (changes) => planWorkspace({ ...answers, ...changes });

const paths = (changes) => plan(changes).files.map((file) => file.path);

describe("isWorkspaceName", () => {
  it("accepts lower case words joined by single hyphens", () => {
    expect(isWorkspaceName("metrics")).toBe(true);
    expect(isWorkspaceName("spell-check")).toBe(true);
    expect(isWorkspaceName("base64")).toBe(true);
  });

  it("rejects what a folder name may not carry", () => {
    const rejected = [
      "",
      "Metrics",
      "-metrics",
      "metrics-",
      "spell--check",
      "@repo/metrics",
      "a b",
    ];

    for (const value of rejected) expect(isWorkspaceName(value)).toBe(false);
  });
});

describe("planWorkspace", () => {
  it("puts the workspace under the folder of its kind", () => {
    expect(plan().folder).toBe("packages/metrics");
    expect(plan({ kind: "tooling" }).folder).toBe("tooling/metrics");
  });

  it("names the package under the repository scope", () => {
    expect(plan().data.packageName).toBe("@repo/metrics");
  });

  it("writes every file a workspace needs to pass the checks", () => {
    expect(paths()).toEqual([
      "packages/metrics/package.json",
      "packages/metrics/tsconfig.json",
      "packages/metrics/eslint.config.mjs",
      "packages/metrics/vitest.config.mts",
      "packages/metrics/cspell.json",
      "packages/metrics/.prettierignore",
      "packages/metrics/README.md",
      "packages/metrics/src/index.ts",
    ]);
  });

  it("reads the summary and the kind into the data the templates render", () => {
    expect(plan({ summary: "  Counters.  " }).data).toMatchObject({
      emoji: "📦",
      entry: "@repo/metrics",
      kind: "packages",
      layers: false,
      name: "metrics",
      summary: "Counters.",
      typeLabel: "package",
    });
  });

  it("moves the entry into the shared layer when the package holds layers", () => {
    expect(paths({ layers: true }).at(-1)).toBe("packages/metrics/src/shared/lib/index.ts");
    expect(plan({ layers: true }).data.entry).toBe("@repo/metrics/shared/lib");
  });

  it("registers an FSD root only for a package that holds layers", () => {
    expect(plan({ layers: true }).fsdRoot).toBe("packages/metrics/src");
    expect(plan().fsdRoot).toBe(null);
  });

  it("refuses answers a check would reject later", () => {
    expect(() => plan({ kind: "apps" })).toThrow(/packages, tooling/u);
    expect(() => plan({ name: "Metrics" })).toThrow(/folder name/u);
    expect(() => plan({ summary: "   " })).toThrow(/summary/u);
    expect(() => plan({ kind: "tooling", layers: true })).toThrow(/layers/u);
  });

  it("offers the kinds the prompt lists", () => {
    expect(WORKSPACE_KINDS).toEqual(["packages", "tooling"]);
  });

  it("names a template that exists for every file it writes", () => {
    for (const { templateFile } of plan({ layers: true }).files) {
      expect(existsSync(path.join(generatorRoot, templateFile))).toBe(true);
    }
  });
});
