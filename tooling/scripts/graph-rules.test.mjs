import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { describe, expect, onTestFinished, test } from "vitest";

import {
  findExecutable,
  GRAPHIFY,
  REBUILD_STEPS,
  shouldRebuild,
  withoutGitVariables,
} from "./graph-rules.mjs";

const HEAD = "0123456789abcdef0123456789abcdef01234567";

describe("shouldRebuild", () => {
  test.each([
    ["post-commit", [], true],
    ["post-checkout", [HEAD, HEAD, "1"], true],
    ["post-checkout", [HEAD, HEAD, "0"], false],
    ["post-merge", ["0"], true],
    ["post-merge", ["1"], true],
    ["post-rewrite", ["rebase"], true],
    ["post-rewrite", ["amend"], false],
    ["pre-commit", [], false],
    ["constructor", [], false],
    ["toString", [], false],
  ])("%s %j rebuilds: %s", (hook, args, expected) => {
    expect(shouldRebuild(hook, args)).toBe(expected);
  });
});

describe("REBUILD_STEPS", () => {
  test("rebuilds the whole graph without an LLM, then writes the Obsidian notes", () => {
    expect(GRAPHIFY).toBe("graphify");
    expect(REBUILD_STEPS).toEqual([
      ["update", ".", "--force", "--no-description", "--no-label"],
      ["export", "obsidian"],
    ]);
  });
});

describe("findExecutable", () => {
  const createBin = () => {
    const root = realpathSync(mkdtempSync(path.join(tmpdir(), "graph-rules-")));

    onTestFinished(() => {
      rmSync(root, { recursive: true, force: true });
    });

    const directory = (name) => {
      const folder = path.join(root, name);

      mkdirSync(folder, { recursive: true });

      return folder;
    };

    const write = (folder, file, mode = 0o755) => {
      writeFileSync(path.join(folder, file), "#!/bin/sh\n", { mode });

      return path.join(folder, file);
    };

    return { directory, write };
  };

  test("finds a command on the PATH", () => {
    const { directory, write } = createBin();
    const bin = directory("bin");
    const graphify = write(bin, "graphify");

    expect(findExecutable("graphify", { PATH: bin }, "darwin")).toBe(graphify);
  });

  test("takes the first match in PATH order", () => {
    const { directory, write } = createBin();
    const first = directory("first");
    const second = directory("second");

    write(second, "graphify");

    const expected = write(first, "graphify");

    expect(
      findExecutable("graphify", { PATH: [first, second].join(path.delimiter) }, "linux"),
    ).toBe(expected);
  });

  test("skips a file that is not executable and a folder with the same name", () => {
    const { directory, write } = createBin();
    const plain = directory("plain");
    const folders = directory("folders");
    const bin = directory("bin");

    write(plain, "graphify", 0o644);
    mkdirSync(path.join(folders, "graphify"));

    const expected = write(bin, "graphify");
    const searchPath = [plain, folders, bin].join(path.delimiter);

    expect(findExecutable("graphify", { PATH: searchPath }, "linux")).toBe(expected);
    expect(
      findExecutable("graphify", { PATH: [plain, folders].join(path.delimiter) }, "linux"),
    ).toBeUndefined();
  });

  test("tries the PATHEXT extensions on Windows", () => {
    const { directory, write } = createBin();
    const bin = directory("bin");
    const expected = write(bin, "graphify.CMD");

    expect(findExecutable("graphify", { PATH: bin, PATHEXT: ".EXE;.CMD" }, "win32")).toBe(expected);
  });

  test("finds nothing with an empty or missing PATH", () => {
    expect(findExecutable("graphify", { PATH: "" }, "linux")).toBeUndefined();
    expect(findExecutable("graphify", {}, "linux")).toBeUndefined();
  });
});

describe("withoutGitVariables", () => {
  test("drops what git exports to its hooks and keeps the rest", () => {
    expect(
      withoutGitVariables({
        GIT_DIR: ".git",
        GIT_INDEX_FILE: ".git/index.lock",
        HOME: "/home/ada",
        PATH: "/usr/bin",
      }),
    ).toEqual({ HOME: "/home/ada", PATH: "/usr/bin" });
  });
});
