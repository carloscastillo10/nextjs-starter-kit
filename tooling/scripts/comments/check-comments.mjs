import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { inspectComments, isCheckedSource } from "./comment-rules.mjs";

const trackedFiles = () =>
  execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" }).split("\0").filter(Boolean);

const formatFinding = (marker, { line, message }) =>
  line === undefined ? `  ${marker} ${message}` : `  ${marker} line ${line} ${message}`;

const describeFile = ({ file, failures, reports }) => [
  file,
  ...failures.map((finding) => formatFinding("x", finding)),
  ...reports.map((finding) => formatFinding("!", finding)),
];

const namedFiles = process.argv.slice(2);
const files = (namedFiles.length > 0 ? namedFiles : trackedFiles()).filter(
  (file) => isCheckedSource(file) && existsSync(file),
);
const results = files.map((file) => ({
  file,
  ...inspectComments({ code: readFileSync(file, "utf8"), file }),
}));
const failureCount = results.reduce((total, { failures }) => total + failures.length, 0);
const lines = [
  ...results
    .filter(({ failures, reports }) => failures.length + reports.length > 0)
    .flatMap(describeFile),
  `check-comments: ${files.length} files, ${failureCount} failures`,
];

process.stdout.write(`${lines.join("\n")}\n`);
process.exitCode = failureCount > 0 ? 1 : 0;
