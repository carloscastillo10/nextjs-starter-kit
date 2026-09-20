import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { countAddedComments, inspectComments, isCheckedSource } from "./comment-rules.mjs";

/*
 * Under this, the share convicts the wrong branch: a two-line fix with the reason above it
 * is half comment and exactly right.
 */
const ENOUGH_ADDED_LINES_TO_JUDGE = 200;

const A_CHANGE_IS_MOSTLY_COMMENT_AT = 0.05;

const git = (args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });

const trackedFiles = () => git(["ls-files", "-z"]).split("\0").filter(Boolean);

const formatFinding = (marker, { line, message }) =>
  line === undefined ? `  ${marker} ${message}` : `  ${marker} line ${line} ${message}`;

const describeFile = ({ file, failures, reports }) => [
  file,
  ...failures.map((finding) => formatFinding("x", finding)),
  ...reports.map((finding) => formatFinding("!", finding)),
];

const inspectFiles = (namedFiles) => {
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

  return failureCount > 0 ? 1 : 0;
};

const addedAgainst = (base) => {
  try {
    return countAddedComments(git(["diff", "--unified=0", `${base}...HEAD`]));
  } catch {
    return null;
  }
};

const inspectChange = (base) => {
  const added = addedAgainst(base);

  if (added === null) {
    process.stdout.write(`check-comments: no ${base} to fork from, so nothing was compared\n`);

    return 0;
  }

  const { comments, removed, total } = added;
  const share = total === 0 ? 0 : comments / total;
  const percent = Math.round(share * 100);

  // A change that deletes at least as much comment as it writes is not the habit this hunts.
  if (removed >= comments) {
    process.stdout.write(
      `check-comments: ${comments} comment lines added and ${removed} removed, so this change writes less comment than it found\n`,
    );

    return 0;
  }

  if (total < ENOUGH_ADDED_LINES_TO_JUDGE || share <= A_CHANGE_IS_MOSTLY_COMMENT_AT) {
    process.stdout.write(
      `check-comments: ${comments} of ${total} added lines are comment (${percent}%)\n`,
    );

    return 0;
  }

  process.stderr.write(
    [
      "",
      `  This change is ${percent}% comment: ${comments} of ${total} added lines.`,
      "",
      "  The default is no comment, and one earns its place by carrying a reason the code",
      "  cannot: a vendor's odd behavior, a business rule, a choice that looks wrong and is",
      "  not. Delete the ones that restate what they sit above rather than shortening them.",
      "",
      "",
    ].join("\n"),
  );

  return 1;
};

const args = process.argv.slice(2);
const changedAt = args.indexOf("--changed");

process.exitCode =
  changedAt === -1 ? inspectFiles(args) : inspectChange(args[changedAt + 1] ?? "origin/main");
