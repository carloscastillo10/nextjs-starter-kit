import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const TOOLS = {
  eslint: {
    fix: ["eslint", "--fix", "--max-warnings", "0", "--no-warn-ignored"],
    check: ["eslint", "--max-warnings", "0", "--no-warn-ignored"],
  },
  prettier: {
    fix: ["prettier", "--write", "--ignore-unknown"],
    check: ["prettier", "--check", "--ignore-unknown"],
  },
};

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const lines = (text) => text.split("\n").filter(Boolean);

const recordFile = () => git("rev-parse", "--git-path", "fix-staged-partial");

// Runs before lefthook hides the unstaged half of a file, which a job cannot see it did.
const record = () => {
  const unstaged = new Set(lines(git("diff", "--name-only")));
  const partlyStaged = lines(git("diff", "--cached", "--name-only", "--diff-filter=d")).filter(
    (file) => unstaged.has(file),
  );

  if (partlyStaged.length === 0) rmSync(recordFile(), { force: true });
  else writeFileSync(recordFile(), `${partlyStaged.join("\n")}\n`);

  return 0;
};

const recorded = () => {
  const file = recordFile();

  return new Set(existsSync(file) ? lines(readFileSync(file, "utf8")) : []);
};

const pnpmExec = (args, files) => {
  if (files.length === 0) return 0;

  const { status } = spawnSync("pnpm", ["exec", ...args, ...files], {
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  return status ?? 1;
};

/*
 * Rewriting a partly staged file can collide with its hidden unstaged lines, and lefthook
 * then reverts every unstaged change in the repository. So those files are only checked.
 */
const fixOrCheck = (tool, files) => {
  const commands = TOOLS[tool];

  if (commands === undefined) {
    process.stderr.write(`fix-staged: unknown tool "${tool}", expected one of: eslint, prettier\n`);

    return 2;
  }

  const partlyStaged = recorded();
  const toCheck = files.filter((file) => partlyStaged.has(file));
  const toFix = files.filter((file) => !partlyStaged.has(file));

  if (toCheck.length > 0) {
    process.stderr.write(
      `fix-staged: ${tool} only checks ${toCheck.join(", ")}, staged in part. Stage the whole file, or run pnpm format:fix or pnpm lint:fix, to have it fixed.\n`,
    );
  }

  return Math.max(pnpmExec(commands.fix, toFix), pnpmExec(commands.check, toCheck));
};

const [mode, ...files] = process.argv.slice(2);

process.exitCode = mode === "--record" ? record() : fixOrCheck(mode, files);
