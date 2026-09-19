import { execFile, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const run = promisify(execFile);

const CHECK_TIMEOUT_MS = 20_000;

const SOURCE = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs"]);

const SPELLED = new Set([...SOURCE, ".md", ".css", ".json", ".jsonc", ".yml", ".yaml"]);

const UNOWNED =
  /(?:^|[\\/])(?:node_modules|\.git|\.turbo|\.next|\.graphify|\.obsidian)[\\/]|^\.claude[\\/]skills[\\/]|^\.agents[\\/]/u;

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();

const script = (name) => fileURLToPath(new URL(`../${name}`, import.meta.url));

const readPayload = async () => {
  const chunks = [];

  for await (const chunk of process.stdin) chunks.push(chunk);

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
};

const bin = (name) => path.join(root, "node_modules", ".bin", name);

const sourceChecks = (file) => [
  { args: ["--no-warn-ignored", file], command: bin("eslint"), label: "eslint" },
  /*
   * The density and length findings are judgement the agent should weigh rather than obey,
   * and they only reach it on an exit code of zero, so this one reports either way.
   */
  {
    advisory: true,
    args: [script("comments/check-comments.mjs"), file],
    command: process.execPath,
    label: "comments",
  },
];

const documentChecks = (file) => [
  { args: [file], command: bin("markdownlint-cli2"), label: "markdownlint" },
  {
    args: [script("markdown/check-frontmatter.mjs"), file],
    command: process.execPath,
    label: "frontmatter",
  },
];

const spellingCheck = (file) => ({
  args: ["--no-progress", "--no-must-find-files", file],
  command: bin("cspell"),
  label: "cspell",
});

const formattingCheck = (file) => ({
  args: ["--check", "--ignore-unknown", file],
  command: bin("prettier"),
  label: "prettier",
});

const checksFor = (file) => {
  const extension = path.extname(file);

  return [
    ...(SOURCE.has(extension) ? sourceChecks(file) : []),
    ...(extension === ".md" ? documentChecks(file) : []),
    ...(SPELLED.has(extension) ? [spellingCheck(file)] : []),
    formattingCheck(file),
  ];
};

const withoutSummary = (output) =>
  output
    .split("\n")
    .filter((line) => line.trim() !== "" && !line.startsWith("check-comments:"))
    .join("\n");

const reportOf = async (check) => {
  try {
    const { stdout } = await run(check.command, check.args, {
      cwd: root,
      timeout: CHECK_TIMEOUT_MS,
    });

    return check.advisory === true ? withoutSummary(stdout ?? "") : "";
  } catch (error) {
    const output =
      check.advisory === true ? (error.stdout ?? "") : `${error.stdout ?? ""}${error.stderr ?? ""}`;

    return check.advisory === true ? withoutSummary(output) : output.trim();
  }
};

const writtenPathIn = (payload) =>
  payload?.tool_response?.filePath ?? payload?.tool_input?.file_path ?? null;

// Whatever git is told to ignore belongs to a tool or to one person, not to the repository.
const isIgnoredByGit = (relative) => {
  try {
    execFileSync("git", ["check-ignore", "--quiet", "--", relative], {
      cwd: root,
      stdio: "ignore",
    });

    return true;
  } catch {
    return false;
  }
};

const isOwned = (relative) =>
  relative !== "" &&
  !relative.startsWith("..") &&
  !UNOWNED.test(relative) &&
  !isIgnoredByGit(relative);

const targetIn = (payload) => {
  const written = writtenPathIn(payload);

  if (typeof written !== "string") return null;

  const relative = path.relative(root, path.resolve(root, written));

  return isOwned(relative) && existsSync(path.join(root, relative)) ? relative : null;
};

const file = targetIn(await readPayload());

if (file === null) process.exit(0);

const reports = await Promise.all(
  checksFor(file)
    .filter((check) => check.command === process.execPath || existsSync(check.command))
    .map(async (check) => ({ label: check.label, report: await reportOf(check) })),
);
const findings = reports
  .filter(({ report }) => report !== "")
  .map(({ label, report }) => `${label}:\n${report}`);

if (findings.length === 0) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      additionalContext:
        `The repository's own checks have something to say about ${file}. Answer them now, in ` +
        `this file, rather than leaving them for the commit hook or a reviewer to ` +
        `catch:\n\n${findings.join("\n\n")}`,
      hookEventName: "PostToolUse",
    },
  }),
);
