import { describe, expect, it } from "vitest";

import { countAddedComments } from "./comment-rules.mjs";

const diffOf = (file, lines) =>
  ["diff --git", `+++ b/${file}`, "@@ -1,4 +1,4 @@", ...lines].join("\n");

describe("countAddedComments", () => {
  it("counts the comment lines a change removes, not only the ones it adds", () => {
    const diff = diffOf("a.ts", [
      "-// the long way of saying it",
      "-// spread over two lines",
      "+// the short way",
      "+const a = 1;",
    ]);

    expect(countAddedComments(diff)).toStrictEqual({ comments: 1, removed: 2, total: 2 });
  });

  it("counts a removed comment in YAML too", () => {
    const diff = diffOf("lefthook.yml", ["-# a reason", "-# spread over two lines", "+a: 1"]);

    expect(countAddedComments(diff)).toStrictEqual({ comments: 0, removed: 2, total: 1 });
  });

  it("counts a removed block comment line by line", () => {
    const diff = diffOf("a.ts", ["-/*", "- * a reason", "- */", "+const a = 1;"]);

    expect(countAddedComments(diff)).toStrictEqual({ comments: 0, removed: 3, total: 1 });
  });

  it("reads the two sides of a diff without letting one leak into the other", () => {
    const diff = diffOf("a.ts", [
      "-/*",
      "+// added",
      "- * still the removed block",
      "+const a = 1;",
      "- */",
    ]);

    expect(countAddedComments(diff)).toStrictEqual({ comments: 1, removed: 3, total: 2 });
  });

  it("takes neither file header for a line of the change", () => {
    const diff = [
      "diff --git a/a.ts b/a.ts",
      "--- a/a.ts",
      "+++ b/a.ts",
      "@@ -1 +1 @@",
      "+const a = 1;",
    ].join("\n");

    expect(countAddedComments(diff)).toStrictEqual({ comments: 0, removed: 0, total: 1 });
  });
});
