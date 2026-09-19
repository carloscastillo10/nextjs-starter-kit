import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { beforeEach, describe, expect, it } from "vitest";

import { registerFsdRoot, withFsdRoot } from "./register-fsd-root.mjs";

const listed = { roots: ["apps/web/src"] };

let file = "";

const read = () => readFileSync(file, "utf8");

beforeEach(() => {
  file = path.join(mkdtempSync(path.join(tmpdir(), "fsd-roots-")), "fsd-roots.json");
  writeFileSync(file, `${JSON.stringify(listed, null, 2)}\n`);
});

describe("withFsdRoot", () => {
  it("returns the roots with the new one in order", () => {
    expect(withFsdRoot({ roots: ["packages/kit/src"] }, "apps/web/src")).toEqual({
      roots: ["apps/web/src", "packages/kit/src"],
    });
  });

  it("leaves the document it was given alone", () => {
    const document = { roots: ["apps/web/src"] };

    withFsdRoot(document, "packages/kit/src");

    expect(document.roots).toEqual(["apps/web/src"]);
  });

  it("refuses a root the two linters would not accept", () => {
    expect(() => withFsdRoot(listed, "packages/kit/src/")).toThrow(/trailing slash/u);
    expect(() => withFsdRoot(listed, "../kit/src")).toThrow(/relative to the repository root/u);
    expect(() => withFsdRoot(listed, "kit")).toThrow(/inside apps/u);
  });

  it("refuses a root that is already listed", () => {
    expect(() => withFsdRoot(listed, "apps/web/src")).toThrow(/already/u);
  });

  it("refuses a list that is not the one this repository declares", () => {
    expect(() => withFsdRoot({}, "packages/kit/src")).toThrow(/list of FSD roots/u);
  });
});

describe("registerFsdRoot", () => {
  it("writes the root into the file and returns the list", () => {
    expect(registerFsdRoot({ file, root: "packages/kit/src" })).toEqual([
      "apps/web/src",
      "packages/kit/src",
    ]);

    expect(read()).toBe('{\n  "roots": [\n    "apps/web/src",\n    "packages/kit/src"\n  ]\n}\n');
  });

  it("leaves the file untouched when the root is refused", () => {
    const before = read();

    expect(() => registerFsdRoot({ file, root: "apps/web/src" })).toThrow(/already/u);
    expect(read()).toBe(before);
  });
});
