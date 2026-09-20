import { describe, expect, it } from "vitest";

import { findEchoes } from "./comment-echo-rules.mjs";

const SENTENCE = "a rebuild started by a git hook never writes the graph at the same time";

const diffOf = (files) =>
  files
    .flatMap(([file, lines]) => [
      "diff --git",
      `+++ b/${file}`,
      "@@ -0,0 +1 @@",
      ...lines.map((line) => `+${line}`),
    ])
    .join("\n");

describe("findEchoes", () => {
  it("catches a YAML comment repeating prose the same change writes", () => {
    const diff = diffOf([
      ["lefthook.yml", [`# ${SENTENCE}`, "a: 1"]],
      ["docs/a.md", [`Note that ${SENTENCE}.`]],
    ]);

    expect(findEchoes(diff).echoes).toStrictEqual([
      { file: "lefthook.yml", shingle: "a rebuild started by a git hook never" },
    ]);
  });

  it("catches a JSONC comment doing the same", () => {
    const diff = diffOf([
      ["a.jsonc", [`// ${SENTENCE}`, '"a": 1']],
      ["docs/a.md", [`Note that ${SENTENCE}.`]],
    ]);

    expect(findEchoes(diff).echoes.map(({ file }) => file)).toStrictEqual(["a.jsonc"]);
  });

  it("counts a YAML comment among the comment lines it read", () => {
    const diff = diffOf([["lefthook.yml", ["# a reason", "a: 1"]]]);

    expect(findEchoes(diff).commentCount).toBe(1);
  });

  it("leaves a comment that says something the documents do not", () => {
    const diff = diffOf([
      ["lefthook.yml", ["# a reason of its own that appears nowhere else", "a: 1"]],
      ["docs/a.md", [`Note that ${SENTENCE}.`]],
    ]);

    expect(findEchoes(diff).echoes).toStrictEqual([]);
  });
});
