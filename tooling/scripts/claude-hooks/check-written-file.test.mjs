import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, onTestFinished, test } from "vitest";

const SCRIPT = fileURLToPath(new URL("check-written-file.mjs", import.meta.url));

const TOOLS = ["eslint", "prettier", "cspell", "markdownlint-cli2"];

const createProject = (files = {}) => {
  const root = mkdtempSync(path.join(tmpdir(), "check-written-file-"));

  onTestFinished(() => {
    rmSync(root, { recursive: true, force: true });
  });

  for (const [name, text] of Object.entries(files)) {
    const target = path.join(root, name);

    mkdirSync(path.dirname(target), { recursive: true });
    writeFileSync(target, text);
  }

  return root;
};

// Each stands in for the real tool and always complains, so the wiring is what is tested.
const installTools = (root, names = TOOLS) => {
  const bin = path.join(root, "node_modules", ".bin");

  mkdirSync(bin, { recursive: true });

  for (const name of names) {
    writeFileSync(path.join(bin, name), `#!/bin/sh\necho "${name} says no"\nexit 1\n`, {
      mode: 0o755,
    });
  }
};

const runHook = (root, payload) => {
  const { status, stdout } = spawnSync(process.execPath, [SCRIPT], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, CLAUDE_PROJECT_DIR: root },
    input: JSON.stringify(payload),
  });

  return {
    context: stdout === "" ? "" : JSON.parse(stdout).hookSpecificOutput.additionalContext,
    status,
  };
};

const wrote = (root, file) => ({
  tool_input: { file_path: path.join(root, file) },
  tool_name: "Write",
});

describe("check-written-file, on what it looks at", () => {
  test("says nothing about a payload with no file", () => {
    const root = createProject();

    expect(runHook(root, { tool_name: "Write" })).toEqual({ context: "", status: 0 });
  });

  test("says nothing about a file that is not there", () => {
    const root = createProject();

    expect(runHook(root, wrote(root, "docs/gone.md")).context).toBe("");
  });

  test("says nothing about a file outside the project", () => {
    const root = createProject();
    const outside = path.join(root, "..", path.basename(root), "..", "outside.md");

    installTools(root);
    writeFileSync(outside, "# Outside\n");
    onTestFinished(() => {
      rmSync(outside, { force: true });
    });

    expect(runHook(root, { tool_input: { file_path: outside }, tool_name: "Write" }).context).toBe(
      "",
    );
  });

  test.each([
    "node_modules/a-package/index.js",
    ".claude/skills/shadcn/example.ts",
    ".graphify/obsidian/index.md",
  ])("says nothing about %s, which nobody writes by hand", (file) => {
    const root = createProject({ [file]: "const a = 1\n" });

    installTools(root);

    expect(runHook(root, wrote(root, file)).context).toBe("");
  });

  test("says nothing about a file git is told to ignore", () => {
    const root = createProject({
      ".gitignore": "secrets/\n",
      "secrets/notes.md": "# Notes\n",
    });

    execFileSync("git", ["init", "--quiet"], { cwd: root });
    installTools(root);

    expect(runHook(root, wrote(root, "secrets/notes.md")).context).toBe("");
  });

  test("reads the path the tool reports back as well as the one it was given", () => {
    const root = createProject({ "docs/guide.md": "# Guide\n" });

    expect(
      runHook(root, {
        tool_name: "Write",
        tool_response: { filePath: path.join(root, "docs/guide.md") },
      }).context,
    ).toContain("docs/guide.md");
  });
});

describe("check-written-file, on what it runs", () => {
  test("runs the linters a source file needs and names each one", () => {
    const root = createProject({ "src/retry.ts": "export const retries = 2;\n" });

    installTools(root);

    const { context, status } = runHook(root, wrote(root, "src/retry.ts"));

    expect(status).toBe(0);
    expect(context).toContain("eslint says no");
    expect(context).toContain("prettier says no");
    expect(context).toContain("cspell says no");
    expect(context).not.toContain("markdownlint-cli2 says no");
  });

  test("runs the Markdown checks on a document", () => {
    const root = createProject({
      "docs/guide.md": "---\ntags: [guide]\naliases: []\n---\n\n# G\n",
    });

    installTools(root);

    const { context } = runHook(root, wrote(root, "docs/guide.md"));

    expect(context).toContain("markdownlint-cli2 says no");
    expect(context).toContain("cspell says no");
    expect(context).not.toContain("eslint says no");
  });
});

describe("check-written-file, on what it reports", () => {
  test("reports the missing frontmatter of a document", () => {
    const root = createProject({ "docs/guide.md": "# Guide\n" });

    const { context } = runHook(root, wrote(root, "docs/guide.md"));

    expect(context).toContain("frontmatter:");
    expect(context).toContain("has no frontmatter block");
  });

  test("reports a comment that cites a path, even though the check exits zero on reports", () => {
    const root = createProject({
      "src/retry.ts": "// See apps/web/next.config.ts.\nexport const retries = 2;\n",
    });

    const { context, status } = runHook(root, wrote(root, "src/retry.ts"));

    expect(status).toBe(0);
    expect(context).toContain("comments:");
    expect(context).toContain("cites a path into the repository");
  });

  test("reports the density finding of a file the comment check still passes", () => {
    const lines = Array.from(
      { length: 12 },
      (_, index) => `// Reason ${index}.\nexport const value${index} = ${index};`,
    );
    const root = createProject({ "src/dense.ts": `${lines.join("\n")}\n` });

    const { context } = runHook(root, wrote(root, "src/dense.ts"));

    expect(context).toContain("are comments");
  });

  test("says nothing when every check is happy", () => {
    const root = createProject({ "src/retry.ts": "export const retries = 2;\n" });

    expect(runHook(root, wrote(root, "src/retry.ts")).context).toBe("");
  });

  test("skips a tool the project has not installed", () => {
    const root = createProject({ "src/retry.ts": "export const retries = 2;\n" });

    installTools(root, ["prettier"]);

    const { context } = runHook(root, wrote(root, "src/retry.ts"));

    expect(context).toContain("prettier says no");
    expect(context).not.toContain("eslint");
  });

  test("checks the formatting of a file no other check covers", () => {
    const root = createProject({ "turbo.json": "{}\n" });

    installTools(root);

    const { context } = runHook(root, wrote(root, "turbo.json"));

    expect(context).toContain("prettier says no");
    expect(context).toContain("cspell says no");
  });
});
