import { execFileSync } from "node:child_process";

import { findEchoes } from "./comment-echo-rules.mjs";

const DEFAULT_BASE = "origin/main";

const base = process.argv[2] ?? DEFAULT_BASE;

const git = (args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

const forkPoint = () => {
  try {
    return git(["merge-base", base, "HEAD"]);
  } catch {
    return null;
  }
};

const from = forkPoint();

if (from === null) {
  process.stdout.write(`check-comment-echo: no ${base} to fork from, so nothing was compared\n`);
  process.exit(0);
}

// The working tree, not HEAD, so a comment deleted and not yet committed is gone.
const { commentCount, echoes } = findEchoes(git(["diff", from, "--unified=0"]));

if (echoes.length === 0) {
  process.stdout.write(
    `check-comment-echo: ${commentCount} comment lines, none repeating prose this change also writes\n`,
  );
  process.exit(0);
}

const report = [
  "",
  "  Comments saying what a document in this same change already says:",
  "",
  ...echoes.flatMap(({ file, shingle }) => [`    x ${file}`, `        …${shingle}…`]),
  "",
  "  A reason written twice drifts, and the copy beside the code is the one that goes stale",
  "  first: a reader looking for reasoning opens the document, not the function. Delete the",
  "  comment and keep the document, or delete the paragraph and keep the comment.",
  "",
];

process.stderr.write(`${report.join("\n")}\n`);
process.exitCode = 1;
