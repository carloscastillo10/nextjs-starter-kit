import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";

import { readClosingRefs } from "./read-closing-refs.mjs";

const SCRIPT = fileURLToPath(new URL("read-closing-refs.mjs", import.meta.url));

const run = (body) => {
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    encoding: "utf8",
    env: { ...process.env, PR_BODY: body },
  });

  return { status, stdout };
};

describe("readClosingRefs reads the issues a body closes", () => {
  test.each([
    ["Closes #12", [12]],
    ["closes #12", [12]],
    ["Closed #12", [12]],
    ["Fixes #12", [12]],
    ["Fixed #12", [12]],
    ["Fix #12", [12]],
    ["Resolves #12", [12]],
    ["Resolved #12", [12]],
    ["Resolve #12", [12]],
  ])("takes %j as %j", (body, expected) => {
    expect(readClosingRefs(body)).toEqual(expected);
  });

  test("keeps every issue a body names, in the order it names them", () => {
    expect(readClosingRefs("Closes #7.\n\nFixes #3 and resolves #11.")).toEqual([7, 3, 11]);
  });

  test("names an issue once however often the body closes it", () => {
    expect(readClosingRefs("Closes #7. Fixes #7.")).toEqual([7]);
  });

  test("reads a reference GitHub honours inside a blockquote", () => {
    expect(readClosingRefs("> Closes #7")).toEqual([7]);
  });
});

describe("readClosingRefs leaves out what GitHub leaves out", () => {
  test("ignores a reference inside a fenced block, which GitHub does not act on", () => {
    expect(readClosingRefs("```\nCloses #7\n```\n\nCloses #8")).toEqual([8]);
  });

  test("ignores a reference inside a tilde fenced block", () => {
    expect(readClosingRefs("~~~\nCloses #7\n~~~\n\nCloses #8")).toEqual([8]);
  });

  test("ignores a reference inside inline code", () => {
    expect(readClosingRefs("`Closes #7` shows the keyword. Closes #8")).toEqual([8]);
  });

  test("ignores a mention that is not a closing keyword", () => {
    expect(readClosingRefs("See #7, which relates to this. Part of #8.")).toEqual([]);
  });

  test("ignores a number that is only the start of something longer", () => {
    expect(readClosingRefs("Closes #7abc")).toEqual([]);
  });

  test("ignores a keyword that is only the end of a longer word", () => {
    expect(readClosingRefs("Discloses #7")).toEqual([]);
  });

  test.each([undefined, null, ""])("answers nothing for %j", (body) => {
    expect(readClosingRefs(body)).toEqual([]);
  });
});

describe("read-closing-refs as a command", () => {
  test("prints the numbers separated by a space, for a workflow step", () => {
    const { status, stdout } = run("Closes #7 and fixes #11");

    expect(status).toBe(0);
    expect(stdout).toBe("7 11\n");
  });

  test("prints an empty line when the body names none", () => {
    const { status, stdout } = run("Nothing to close here.");

    expect(status).toBe(0);
    expect(stdout).toBe("\n");
  });

  test("reads the body from its argument when the environment carries none", () => {
    const environment = { ...process.env };

    delete environment.PR_BODY;

    const { status, stdout } = spawnSync(process.execPath, [SCRIPT, "Closes #4"], {
      encoding: "utf8",
      env: environment,
    });

    expect(status).toBe(0);
    expect(stdout).toBe("4\n");
  });
});
