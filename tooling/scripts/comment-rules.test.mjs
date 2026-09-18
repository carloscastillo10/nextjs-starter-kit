import { describe, expect, test } from "vitest";

import { inspectComments, isCheckedSource } from "./comment-rules.mjs";

const failuresIn = (code, file = "src/lib/format.ts") =>
  inspectComments({ code, file }).failures.map(({ line, rule }) => ({ line, rule }));

const reportsIn = (code, file = "src/lib/format.ts") =>
  inspectComments({ code, file }).reports.map(({ rule }) => rule);

describe("isCheckedSource", () => {
  test.each([
    "apps/web/src/_pages/home/ui/HomePage.tsx",
    "apps/web/next.config.ts",
    "tooling/scripts/check-comments.mjs",
    "packages/ui/src/button.jsx",
    "tooling/eslint/base.js",
    "config/legacy.cjs",
    "vitest.config.mts",
    "types/shared.cts",
  ])("checks %s", (file) => {
    expect(isCheckedSource(file)).toBe(true);
  });

  test.each([
    "README.md",
    "package.json",
    "apps/web/next-env.d.ts",
    "tooling/vitest/base.d.ts",
    ".claude/skills/shadcn/templates/button.tsx",
    ".agents/skills/example.ts",
    "node_modules/next/dist/server.js",
    "apps/web/.next/server/app/page.js",
    "apps/web/.turbo/cache.js",
    "packages/ui/dist/index.js",
    "coverage/lcov-report/sorter.js",
  ])("skips %s", (file) => {
    expect(isCheckedSource(file)).toBe(false);
  });
});

describe("citations", () => {
  test.each([
    ["// Mirrors apps/web/src/shared/config/index.ts.", "path"],
    ["// Same shape as @/shared/api.", "import-path"],
    ["// Read by next.config.ts at build time.", "file-name"],
    ["// Works around #42.", "issue"],
    ["// The guide explains it in §4.", "section"],
    ["// As section 3.2 of the guide says.", "section"],
  ])("fails on %s", (code, rule) => {
    expect(failuresIn(code)).toEqual([{ line: 1, rule }]);
  });

  test("reports the line inside a block where the citation sits", () => {
    const code = [
      "/*",
      " * The shape matches the one the",
      " * route handler in apps/web/app builds.",
      " */",
    ];

    expect(failuresIn(code.join("\n"))).toEqual([{ line: 3, rule: "path" }]);
  });

  test("names the cited text without trailing punctuation", () => {
    const [failure] = inspectComments({ code: "// See docs/README.md.", file: "a.ts" }).failures;

    expect(failure?.message).toContain('"docs/README.md"');
  });

  test.each([
    "// Next.js caches the response, and Node.js keeps the socket open.",
    "// Upstream bug: https://github.com/vercel/next.js/blob/canary/packages/next/src/server/app.ts",
    "// See https://nextjs.org/docs/app#routing for the reason.",
    "// format.ts is the only module that knows the currency.",
    "// Retries twice because the provider drops the first request after a deploy.",
  ])("passes %s", (code) => {
    expect(failuresIn(code)).toEqual([]);
  });
});

describe("one-line block comments", () => {
  test.each([
    ["/* Loads the settings once. */\nexport const load = () => 1;", 1],
    ["export const load = () => {\n  /** Cached for the process. */\n  return 1;\n};", 2],
  ])("fails when a block sits alone on one line: %s", (code, line) => {
    expect(failuresIn(code)).toEqual([{ line, rule: "one-line-block" }]);
  });

  test.each([
    [
      "a JSX comment",
      "export const Page = () => (\n  <main>\n    {/* The list renders here. */}\n  </main>\n);",
      "page.tsx",
    ],
    ["a pure annotation", "export const store =\n  /*#__PURE__*/\n  create();", "store.ts"],
    [
      "a no-side-effects annotation",
      "/* @__NO_SIDE_EFFECTS__ */\nexport const create = () => ({});",
      "store.ts",
    ],
    ["a block after code", "export const limit = 3; /* the provider's cap */", "limit.ts"],
    [
      "a block spread over several lines",
      "/*\n * The provider caps requests\n * at three per second.\n */\nexport const limit = 3;",
      "limit.ts",
    ],
    [
      "a line comment",
      "// The provider caps requests at three per second.\nexport const limit = 3;",
      "limit.ts",
    ],
  ])("passes %s", (_label, code, file) => {
    expect(failuresIn(code, file)).toEqual([]);
  });
});

describe("lint directives", () => {
  test.each([
    "// eslint-disable-next-line no-console",
    "/* eslint-disable */",
    '/* eslint no-console: "off" */',
    "/* global window */",
    "/* exported helper */",
    "export const limit = 3; // eslint-disable-line",
  ])("fails once on %s", (code) => {
    expect(failuresIn(code)).toEqual([{ line: 1, rule: "directive" }]);
  });

  test("fails on a line comment that tries to disable a rule", () => {
    expect(failuresIn("// eslint-disable no-console")).toEqual([{ line: 1, rule: "directive" }]);
  });

  test.each([
    "// ESLint cannot see through the dynamic import.",
    "// global cache shared by every request",
    "// exported for the tests only",
  ])("passes prose in a line comment: %s", (code) => {
    expect(failuresIn(code)).toEqual([]);
  });
});

describe("parsing", () => {
  test("fails on a file it cannot parse, at the line of the error", () => {
    expect(failuresIn("export const limit = 3;\nexport const = ;")).toEqual([
      { line: 2, rule: "parse-error" },
    ]);
  });

  test.each([
    ["component.jsx", "export const Page = () => <main />; // The shell."],
    ["component.js", "export const Page = () => <main />; // The shell."],
    ["component.tsx", "export const Page = () => <main />; // The shell."],
  ])("parses JSX in %s", (file, code) => {
    expect(failuresIn(code, file)).toEqual([]);
  });
});

const commentedConstants = (count) =>
  Array.from({ length: count }, (_, i) => `// Reason ${i}.\nexport const value${i} = ${i};`);

const plainConstants = (count) =>
  Array.from({ length: count }, (_, i) => `export const plain${i} = ${i};`);

const block = (lineCount) =>
  ["/*", ...Array.from({ length: lineCount - 2 }, () => " * A reason."), " */"].join("\n");

const documented = (name) => `/**\n * Explains ${name}.\n */\nexport const ${name} = 1;`;

describe("reports", () => {
  test("reports a file of 20 or more lines that is over 40% comments", () => {
    const code = commentedConstants(11).join("\n");

    expect(reportsIn(code)).toEqual(["density"]);
  });

  test.each([
    ["under 20 lines", commentedConstants(9).join("\n")],
    ["at 40% or less", [...commentedConstants(8), ...plainConstants(4)].join("\n")],
  ])("does not report density %s", (_label, code) => {
    expect(reportsIn(code)).toEqual([]);
  });

  test("reports a comment block longer than 12 lines", () => {
    expect(reportsIn(`${block(13)}\nexport const limit = 3;`)).toEqual(["long-block"]);
  });

  test("does not report a 12-line block", () => {
    expect(reportsIn(`${block(12)}\nexport const limit = 3;`)).toEqual([]);
  });

  test("reports doc blocks on 60% or more of 3 or more exports", () => {
    const code = [documented("first"), documented("second"), "export const third = 3;"].join("\n");

    expect(reportsIn(code)).toEqual(["doc-everywhere"]);
  });

  test.each([
    ["fewer than 3 exports", [documented("first"), documented("second")].join("\n")],
    [
      "under 60% of the exports",
      [documented("first"), "export const second = 2;", "export const third = 3;"].join("\n"),
    ],
  ])("does not report doc blocks with %s", (_label, code) => {
    expect(reportsIn(code)).toEqual([]);
  });

  test.each(["// const total = sum(items);", "// return cached;", "// if (isReady) {"])(
    "reports what reads like commented-out code: %s",
    (comment) => {
      expect(reportsIn(`${comment}\nexport const limit = 3;`)).toEqual(["commented-code"]);
    },
  );

  test("keeps reports out of the failures", () => {
    const { failures } = inspectComments({ code: "// const total = 1;", file: "total.ts" });

    expect(failures).toEqual([]);
  });
});
