import { describe, expect, it } from "vitest";

import { dialectOf, readComments } from "./comment-dialects.mjs";

const textsOf = ({ code, file }) => readComments({ code, file }).comments.map(({ value }) => value);

describe("dialectOf", () => {
  it("names the dialect of every file type the check reads", () => {
    expect(dialectOf("apps/web/next.config.ts")).toBe("script");
    expect(dialectOf("tooling/eslint/base.js")).toBe("script");
    expect(dialectOf("apps/web/app/page.tsx")).toBe("script");
    expect(dialectOf("lefthook.yml")).toBe("yaml");
    expect(dialectOf(".github/labels.yaml")).toBe("yaml");
    expect(dialectOf(".markdownlint-cli2.jsonc")).toBe("jsonc");
    expect(dialectOf("tooling/markdown/config.json5")).toBe("jsonc");
    expect(dialectOf("packages/ui/src/styles/globals.css")).toBe("css");
  });

  it("has no dialect for a file nobody may comment in, or that nobody wrote", () => {
    expect(dialectOf("package.json")).toBeNull();
    expect(dialectOf("turbo/generators/templates/vitest.config.mts.hbs")).toBeNull();
    expect(dialectOf("README.md")).toBeNull();
    expect(dialectOf("pnpm-lock.yaml")).toBeNull();
    expect(dialectOf("apps/web/next-env.d.ts")).toBeNull();
    expect(dialectOf("node_modules/pkg/index.js")).toBeNull();
    expect(dialectOf(".claude/skills/a/SKILL.mjs")).toBeNull();
  });
});

describe("readComments, YAML", () => {
  it("reads a comment on its own line and one at the end of a line of data", () => {
    const code = ["# a reason", "key: 1 # a trailing reason", ""].join("\n");

    expect(textsOf({ code, file: "a.yml" })).toStrictEqual([" a reason", " a trailing reason"]);
  });

  it("leaves a hash inside a quoted string alone", () => {
    const code = 'key: "a # b"\n';

    expect(textsOf({ code, file: "a.yml" })).toStrictEqual([]);
  });

  it("leaves a hash inside a block scalar alone, because it is data", () => {
    const code = ["run: |", "  # a shell comment", "  echo hi", ""].join("\n");

    expect(textsOf({ code, file: "a.yml" })).toStrictEqual([]);
  });

  it("puts each comment on the line it was written on", () => {
    const code = ["key: 1", "", "# first", "# second", "other: 2", ""].join("\n");
    const { comments } = readComments({ code, file: "a.yml" });

    expect(comments.map(({ loc }) => loc.start.line)).toStrictEqual([3, 4]);
    expect(comments.map(({ loc }) => loc.end.line)).toStrictEqual([3, 4]);
    expect(comments[0].loc.start.column).toBe(0);
  });

  it("reports the file it cannot parse rather than reading no comments from it", () => {
    const { error } = readComments({ code: "key: [1,\n", file: "a.yml" });

    expect(error).toBeDefined();
  });
});

describe("readComments, JSONC", () => {
  it("reads both comment shapes", () => {
    const code = ['{\n  // one\n  /*\n   * two\n   */\n  "a": 1\n}\n'].join("");
    const { comments } = readComments({ code, file: "a.jsonc" });

    expect(comments.map(({ type }) => type)).toStrictEqual(["Line", "Block"]);
    expect(comments[1].loc.start.line).toBe(3);
    expect(comments[1].loc.end.line).toBe(5);
  });

  it("leaves a URL inside a string alone", () => {
    const code = '{ "$schema": "https://example.com/s.json" }\n';

    expect(textsOf({ code, file: "a.jsonc" })).toStrictEqual([]);
  });

  it("leaves an escaped quote from ending a string", () => {
    const code = '{ "a": "b\\" // not a comment" }\n';

    expect(textsOf({ code, file: "a.jsonc" })).toStrictEqual([]);
  });
});

describe("readComments, CSS", () => {
  it("reads a block comment and ignores a slash pair, which CSS has no meaning for", () => {
    const code = ["/* a reason */", "a { content: '// not a comment' }", ""].join("\n");

    expect(textsOf({ code, file: "a.css" })).toStrictEqual([" a reason "]);
  });
});

describe("readComments, script", () => {
  it("still reads a TypeScript file through its parser", () => {
    const code = ['// a reason\nconst url = "https://x";\n'].join("");

    expect(textsOf({ code, file: "a.ts" })).toStrictEqual([" a reason"]);
  });
});
