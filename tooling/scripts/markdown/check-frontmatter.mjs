import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { classifyMarkdown, inspectFrontmatter } from "./frontmatter-rules.mjs";

const MARKDOWN = /\.md$/u;

const trackedFiles = () =>
  execFileSync("git", ["ls-files", "-z", "*.md"], { encoding: "utf8" }).split("\0").filter(Boolean);

const GOVERNED = ["required", "forbidden"];

const isChecked = (file) => MARKDOWN.test(file) && GOVERNED.includes(classifyMarkdown(file).kind);

const describeFile = ({ file, failures }) => [
  file,
  ...failures.map(({ message }) => `  x ${message}`),
];

const namedFiles = process.argv.slice(2);
const files = (namedFiles.length > 0 ? namedFiles : trackedFiles()).filter(
  (file) => isChecked(file) && existsSync(file),
);
const results = files.map((file) => ({
  file,
  ...inspectFrontmatter({ file, text: readFileSync(file, "utf8") }),
}));
const failureCount = results.reduce((total, { failures }) => total + failures.length, 0);
const lines = [
  ...results.filter(({ failures }) => failures.length > 0).flatMap(describeFile),
  `check-frontmatter: ${files.length} files, ${failureCount} failures`,
];

process.stdout.write(`${lines.join("\n")}\n`);
process.exitCode = failureCount > 0 ? 1 : 0;
