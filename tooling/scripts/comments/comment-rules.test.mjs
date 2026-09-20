import { describe, expect, it } from "vitest";

import { countAddedComments, inspectComments, isCheckedSource } from "./comment-rules.mjs";

const rulesOf = (findings) => findings.map(({ rule }) => rule);

const yamlOf = (lines) => ({ code: `${lines.join("\n")}\n`, file: "a.yml" });

describe("isCheckedSource", () => {
  it("now covers the configuration files it used to walk past", () => {
    expect(isCheckedSource("lefthook.yml")).toBe(true);
    expect(isCheckedSource(".markdownlint-cli2.jsonc")).toBe(true);
    expect(isCheckedSource("packages/ui/src/styles/globals.css")).toBe(true);
    expect(isCheckedSource("apps/web/next.config.ts")).toBe(true);
    expect(isCheckedSource("package.json")).toBe(false);
  });
});

describe("what fails, in every dialect", () => {
  it("fails a citation in YAML, which nothing read before", () => {
    const { failures } = inspectComments(yamlOf(["# see next.config.ts for the rest", "a: 1"]));

    expect(rulesOf(failures)).toStrictEqual(["file-name"]);
  });

  it("fails a path and an issue number in YAML", () => {
    const { failures } = inspectComments(yamlOf(["# as in apps/web/src, from #42", "a: 1"]));

    expect(rulesOf(failures)).toStrictEqual(["path", "issue"]);
  });

  it("fails a one-line block comment in JSONC", () => {
    const code = '{\n  /* a reason */\n  "a": 1\n}\n';

    expect(rulesOf(inspectComments({ code, file: "a.jsonc" }).failures)).toStrictEqual([
      "one-line-block",
    ]);
  });

  it("allows a one-line block in CSS, the only one-line form that language has", () => {
    const code = "/* a reason */\na { color: red }\n";

    expect(inspectComments({ code, file: "a.css" }).failures).toStrictEqual([]);
  });

  it("judges a directive only where ESLint would read one", () => {
    const script = "// eslint-disable-next-line no-console\nconsole.log(1);\n";
    const yaml = yamlOf(["# eslint-disable is meaningless here", "a: 1"]);

    expect(rulesOf(inspectComments({ code: script, file: "a.ts" }).failures)).toStrictEqual([
      "directive",
    ]);
    expect(inspectComments(yaml).failures).toStrictEqual([]);
  });

  it("fails the file it cannot parse rather than passing it unread", () => {
    const { failures } = inspectComments({ code: "a: [1,\n", file: "a.yml" });

    expect(rulesOf(failures)).toStrictEqual(["parse-error"]);
  });
});

describe("what only reports", () => {
  it("reports density and never fails on it", () => {
    const lines = [...Array.from({ length: 8 }, (_, at) => `# reason ${at}`), "a: 1"];
    const { failures, reports } = inspectComments(
      yamlOf([...lines, ...Array.from({ length: 14 }, (_, at) => `k${at}: ${at}`)]),
    );

    expect(failures).toStrictEqual([]);
    expect(rulesOf(reports)).toContain("density");
  });

  it("says nothing about a file under the size where a share means anything", () => {
    const { reports } = inspectComments(yamlOf(["# one", "# two", "a: 1"]));

    expect(rulesOf(reports)).not.toContain("density");
  });

  it("reports a run of line comments as the block it reads as", () => {
    const run = Array.from({ length: 13 }, (_, at) => `# line ${at}`);
    const { reports } = inspectComments(yamlOf([...run, "a: 1"]));

    expect(reports.filter(({ rule }) => rule === "long-block")).toStrictEqual([
      { line: 1, rule: "long-block", message: "starts a 13-line comment block" },
    ]);
  });

  it("does not join a comment that shares its line with data to the run above it", () => {
    const run = Array.from({ length: 12 }, (_, at) => `# line ${at}`);
    const { reports } = inspectComments(yamlOf([...run, "a: 1 # a trailing reason"]));

    expect(rulesOf(reports)).not.toContain("long-block");
  });

  it("reads commented-out config in YAML without convicting prose that opens with a keyword", () => {
    const commented = inspectComments(yamlOf(["# esbuild: false", "a: 1"]));
    const prose = inspectComments(
      yamlOf(["# for a required check this counts as passing", "a: 1"]),
    );

    expect(rulesOf(commented.reports)).toStrictEqual(["commented-code"]);
    expect(prose.reports).toStrictEqual([]);
  });
});

describe("countAddedComments", () => {
  const diff = (file, lines) =>
    ["diff --git", `+++ b/${file}`, "@@ -0,0 +1 @@", ...lines.map((line) => `+${line}`)].join("\n");

  it("counts a comment added to a YAML file, which it used to ignore", () => {
    expect(countAddedComments(diff("lefthook.yml", ["# a reason", "a: 1"]))).toStrictEqual({
      comments: 1,
      total: 2,
    });
  });

  it("counts a comment added to a JSONC file", () => {
    expect(countAddedComments(diff("a.jsonc", ["// a reason", '"a": 1']))).toStrictEqual({
      comments: 1,
      total: 2,
    });
  });

  it("still counts a block comment added to a script file", () => {
    const lines = ["/*", " * a reason", " */", "const a = 1;"];

    expect(countAddedComments(diff("a.ts", lines))).toStrictEqual({ comments: 3, total: 4 });
  });

  it("counts nothing from a file no dialect covers", () => {
    expect(countAddedComments(diff("README.md", ["# A heading"]))).toStrictEqual({
      comments: 0,
      total: 0,
    });
  });
});
