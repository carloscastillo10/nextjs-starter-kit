import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, onTestFinished, test } from "vitest";

const SCRIPT = fileURLToPath(new URL("check-frontmatter.mjs", import.meta.url));

const INDEXED = "---\ntags: [conventions]\naliases: [Conventions]\n---\n\n# Title\n";

const PLAIN = "# Title\n";

const createWorkspace = (files) => {
  const directory = mkdtempSync(path.join(tmpdir(), "check-frontmatter-"));

  onTestFinished(() => {
    rmSync(directory, { recursive: true, force: true });
  });

  for (const [name, text] of Object.entries(files)) {
    const file = path.join(directory, name);

    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, text);
  }

  return directory;
};

const runCheck = (directory, files = []) => {
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT, ...files], {
    cwd: directory,
    encoding: "utf8",
  });

  return { status, output: stdout };
};

const git = (directory, args) => {
  execFileSync("git", args, { cwd: directory, stdio: "ignore" });
};

const trackEverything = (directory) => {
  git(directory, ["init", "--quiet"]);
  git(directory, ["add", "."]);
};

describe("check-frontmatter with named files", () => {
  test("prints only the summary and exits 0 when the files carry theirs", () => {
    const directory = createWorkspace({ "docs/conventions/code-style.md": INDEXED });

    expect(runCheck(directory, ["docs/conventions/code-style.md"])).toEqual({
      status: 0,
      output: "check-frontmatter: 1 files, 0 failures\n",
    });
  });

  test("lists the failure under its file and exits 1", () => {
    const directory = createWorkspace({ "docs/conventions/code-style.md": PLAIN });
    const { status, output } = runCheck(directory, ["docs/conventions/code-style.md"]);

    expect(status).toBe(1);
    expect(output).toContain("docs/conventions/code-style.md");
    expect(output).toContain("has no frontmatter block");
    expect(output).toContain("check-frontmatter: 1 files, 1 failures");
  });

  test("fails a decision record with no status", () => {
    const directory = createWorkspace({ "docs/adr/0001-use-turborepo.md": INDEXED });
    const { status, output } = runCheck(directory, ["docs/adr/0001-use-turborepo.md"]);

    expect(status).toBe(1);
    expect(output).toContain("carries status");
  });

  test("passes a decision record with one", () => {
    const directory = createWorkspace({
      "docs/adr/0001-use-turborepo.md":
        "---\ntags: [adr]\naliases: [ADR 1]\nstatus: accepted\n---\n\n# Title\n",
    });

    expect(runCheck(directory, ["docs/adr/0001-use-turborepo.md"]).status).toBe(0);
  });

  test("fails a README that carries one", () => {
    const directory = createWorkspace({ "docs/README.md": INDEXED });
    const { status, output } = runCheck(directory, ["docs/README.md"]);

    expect(status).toBe(1);
    expect(output).toContain("carries frontmatter");
  });

  test("leaves an excluded file alone", () => {
    const directory = createWorkspace({ ".claude/commands/spec.md": PLAIN });

    expect(runCheck(directory, [".claude/commands/spec.md"])).toEqual({
      status: 0,
      output: "check-frontmatter: 0 files, 0 failures\n",
    });
  });

  test("leaves a file that is not Markdown alone", () => {
    const directory = createWorkspace({ "docs/notes.txt": PLAIN });

    expect(runCheck(directory, ["docs/notes.txt"])).toEqual({
      status: 0,
      output: "check-frontmatter: 0 files, 0 failures\n",
    });
  });
});

describe("check-frontmatter without arguments", () => {
  test("checks the Markdown git tracks and leaves untracked files alone", () => {
    const directory = createWorkspace({
      "docs/tracked.md": PLAIN,
      "docs/untracked.md": PLAIN,
    });

    git(directory, ["init", "--quiet"]);
    git(directory, ["add", "docs/tracked.md"]);

    const { status, output } = runCheck(directory);

    expect(status).toBe(1);
    expect(output).toContain("docs/tracked.md");
    expect(output).not.toContain("docs/untracked.md");
    expect(output).toContain("check-frontmatter: 1 files, 1 failures");
  });

  test("skips a tracked file that was deleted from the working tree", () => {
    const directory = createWorkspace({ "docs/gone.md": PLAIN });

    trackEverything(directory);
    rmSync(path.join(directory, "docs/gone.md"));

    expect(runCheck(directory)).toEqual({
      status: 0,
      output: "check-frontmatter: 0 files, 0 failures\n",
    });
  });

  test("checks the documents and the files at the root, and nothing else", () => {
    const directory = createWorkspace({
      "DESIGN.md": INDEXED,
      "README.md": PLAIN,
      "CONTRIBUTING.md": PLAIN,
      "docs/conventions/comments.md": INDEXED,
      "docs/conventions/README.md": PLAIN,
      ".github/pull_request_template.md": PLAIN,
      "packages/ui/src/notes.md": PLAIN,
    });

    trackEverything(directory);

    expect(runCheck(directory)).toEqual({
      status: 0,
      output: "check-frontmatter: 5 files, 0 failures\n",
    });
  });
});
