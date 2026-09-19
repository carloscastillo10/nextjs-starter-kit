import { describe, expect, test } from "vitest";

import { ECHOED_WORDS, findEchoes } from "./comment-echo-rules.mjs";

const diffOf = (files) =>
  Object.entries(files)
    .flatMap(([file, lines]) => [`+++ b/${file}`, ...lines.map((line) => `+${line}`)])
    .join("\n");

const SENTENCE = "the provider drops the first request after every deploy of the service";

describe("findEchoes", () => {
  test("finds a comment repeating a sentence the same change writes into a document", () => {
    const diff = diffOf({
      "docs/integrations/provider.md": [SENTENCE],
      "apps/web/src/retry.ts": [`// ${SENTENCE}`, "export const retries = 2;"],
    });

    expect(findEchoes(diff).echoes).toEqual([
      {
        file: "apps/web/src/retry.ts",
        shingle: SENTENCE.split(" ").slice(0, ECHOED_WORDS).join(" "),
      },
    ]);
  });

  test("leaves a comment alone when the run of shared words is shorter", () => {
    const diff = diffOf({
      "docs/a.md": ["the provider drops the first request"],
      "apps/web/src/retry.ts": ["// the provider drops the first request", "export const a = 1;"],
    });

    expect(findEchoes(diff).echoes).toEqual([]);
  });

  test("reports a file once, however many of its comments echo", () => {
    const diff = diffOf({
      "docs/a.md": [SENTENCE],
      "apps/web/src/retry.ts": [`// ${SENTENCE}`, `// ${SENTENCE}`, "export const a = 1;"],
    });

    expect(findEchoes(diff).echoes).toHaveLength(1);
  });

  test("reads a block comment, continuation lines included", () => {
    const diff = diffOf({
      "docs/a.md": [SENTENCE],
      "apps/web/src/retry.ts": ["/*", ` * ${SENTENCE}`, " */", "export const a = 1;"],
    });

    expect(findEchoes(diff).echoes).toHaveLength(1);
  });
});

describe("findEchoes, on what it leaves out", () => {
  test("ignores the code the change adds, however much prose it repeats", () => {
    const diff = diffOf({
      "docs/a.md": [SENTENCE],
      "apps/web/src/retry.ts": [`export const message = "${SENTENCE}";`],
    });

    expect(findEchoes(diff).echoes).toEqual([]);
  });

  test("ignores a file that is neither source nor prose", () => {
    const diff = diffOf({
      "docs/a.md": [SENTENCE],
      "apps/web/messages.json": [`{ "note": "${SENTENCE}" }`],
    });

    expect(findEchoes(diff).echoes).toEqual([]);
  });

  test("ignores the lines a change removes", () => {
    const diff = [
      "+++ b/docs/a.md",
      `+${SENTENCE}`,
      "+++ b/apps/web/src/retry.ts",
      `-// ${SENTENCE}`,
      "+export const a = 1;",
    ].join("\n");

    expect(findEchoes(diff).echoes).toEqual([]);
  });

  test("compares words rather than punctuation, letter case or code spans", () => {
    const diff = diffOf({
      "docs/a.md": [
        `The **provider** drops the first request, after every deploy of the service. See \`retry\`.`,
      ],
      "apps/web/src/retry.ts": [`// ${SENTENCE}! See \`retry\`.`, "export const a = 1;"],
    });

    expect(findEchoes(diff).echoes).toHaveLength(1);
  });

  test("counts the comment lines it read, so a clean run can say how many", () => {
    const diff = diffOf({
      "apps/web/src/retry.ts": ["// one", "// two", "export const a = 1;"],
    });

    expect(findEchoes(diff)).toEqual({ commentCount: 2, echoes: [] });
  });

  test("leaves the files the comment check skips out of it", () => {
    const diff = diffOf({
      "docs/a.md": [SENTENCE],
      "apps/web/next-env.d.ts": [`// ${SENTENCE}`],
    });

    expect(findEchoes(diff)).toEqual({ commentCount: 0, echoes: [] });
  });
});
