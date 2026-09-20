import path from "node:path";

import { dialectOf, readComments } from "./comment-dialects.mjs";

const CITATIONS = [
  {
    rule: "path",
    what: "a path into the repository",
    pattern: /(?<![\w@./-])(?:apps|packages|tooling|docs|src)\/[\w@.[\]()/-]+/gu,
  },
  {
    rule: "import-path",
    what: "an import path",
    pattern: /(?<![\w./-])@\/[\w@.[\]()/-]+/gu,
  },
  {
    rule: "file-name",
    what: "a file name",
    pattern: /(?<![\w/.-])[\w-][\w.-]*\.(?:[cm]?[jt]sx?|json|jsonc|ya?ml|md|mdx|css|scss|toml)\b/gu,
  },
  {
    rule: "issue",
    what: "an issue or pull request number",
    pattern: /(?<![\w#&/])#\d+\b/gu,
  },
  {
    rule: "section",
    what: "a section number",
    pattern: /§\s?\d+|\bsection\s+\d+(?:\.\d+)*/giu,
  },
];

const PRODUCT_NAME = /^[A-Z][a-z]+\.js$/u;

const TRAILING_PUNCTUATION = /[.,;:]+$/u;

/*
 * ESLint reads configuration (`eslint`, `global`, `exported`) only from block comments,
 * so a line comment is a directive only when it tries to switch rules off or on.
 */
const DIRECTIVE = {
  Block: /^\s*(?:eslint(?:-disable(?:-next-line|-line)?|-enable)?|globals?|exported)(?:\s|$)/u,
  Line: /^\s*eslint-(?:disable|enable)(?:-next-line|-line)?(?:\s|$)/u,
};

const BUNDLER_ANNOTATION = /^\s*[#@]__(?:PURE|NO_SIDE_EFFECTS)__\s*$/u;

/*
 * What commented-out code looks like, which is not the same text in every dialect: a YAML
 * comment is prose often enough that the keyword half would convict "for a required check".
 */
const CODE_LIKE = {
  css: /^(?:import|export|const|let|var|return|if|for|await|function)\b|[;{}]$|\);$/u,
  jsonc: /^(?:import|export|const|let|var|return|if|for|await|function)\b|[;{}]$|\);$/u,
  script: /^(?:import|export|const|let|var|return|if|for|await|function)\b|[;{}]$|\);$/u,
  yaml: /^-\s|^[a-z][\w-]*:(?:\s|$)/u,
};

/*
 * One line in four, down from two in five, because no own file is above a fifth any more.
 * It reports and never fails: whether a comment earns its line is not a call a regex makes.
 */
const DENSITY_LIMIT = 0.25;

const DENSITY_MIN_LINES = 20;

const LONG_BLOCK_LINES = 12;

const DOC_SHARE_LIMIT = 0.6;

const DOC_MIN_EXPORTS = 3;

export const isCheckedSource = (file) => dialectOf(file) !== null;

const ADDED_FILE = /^\+\+\+ b\/(?<file>.*)$/u;

/*
 * A diff has no parser behind it, so these are the line shapes alone. CSS leaves out the bare
 * asterisk that continues a block, because `* { … }` is a selector.
 */
const ADDED_COMMENT = {
  css: /^\/\*/u,
  jsonc: /^(?:\/\/|\/\*|\*)/u,
  script: /^(?:\/\/|\/\*|\*)/u,
  yaml: /^#/u,
};

const BLOCK_ENDS = /\*\/$/u;

export const countAddedComments = (diff) => {
  let dialect = null;
  let comments = 0;
  let code = 0;
  let inBlock = false;

  for (const raw of diff.split("\n")) {
    const header = ADDED_FILE.exec(raw);

    if (header !== null) {
      dialect = dialectOf(header.groups.file);
      inBlock = false;
      continue;
    }

    if (!raw.startsWith("+") || raw.startsWith("+++") || dialect === null) continue;

    const line = raw.slice(1).trim();

    if (line === "") continue;

    if (inBlock) {
      comments += 1;
      inBlock = !BLOCK_ENDS.test(line);
      continue;
    }

    if (ADDED_COMMENT[dialect].test(line)) {
      comments += 1;
      inBlock = line.startsWith("/*") && !BLOCK_ENDS.test(line);
      continue;
    }

    code += 1;
  }

  return { comments, total: comments + code };
};

const commentLines = (comment) =>
  comment.value.split("\n").map((raw, offset) => ({
    line: comment.loc.start.line + offset,
    text: raw.replace(/^\s*\*?\s?/u, "").trim(),
  }));

const citationsInLine = ({ line, text }, ownName) =>
  CITATIONS.flatMap(({ rule, what, pattern }) =>
    [...text.matchAll(pattern)]
      .map((match) => match[0].replace(TRAILING_PUNCTUATION, ""))
      .filter((cited) => cited !== ownName && !PRODUCT_NAME.test(cited))
      .map((cited) => ({ line, rule, message: `cites ${what}: "${cited}"` })),
  );

const findCitations = (comment, file) => {
  const ownName = path.basename(file);

  return commentLines(comment).flatMap((commentLine) => citationsInLine(commentLine, ownName));
};

const isAloneOnItsLine = (comment, sourceLines) => {
  const before = (sourceLines[comment.loc.start.line - 1] ?? "").slice(0, comment.loc.start.column);
  const after = (sourceLines[comment.loc.end.line - 1] ?? "").slice(comment.loc.end.column);

  return before.trim() === "" && after.trim() === "";
};

// CSS has no line comment, so a block alone on one line is the one-line form there.
const isOneLineBlock = ({ comment, dialect, sourceLines }) =>
  dialect !== "css" &&
  comment.type === "Block" &&
  comment.loc.start.line === comment.loc.end.line &&
  !BUNDLER_ANNOTATION.test(comment.value) &&
  isAloneOnItsLine(comment, sourceLines);

const shapeFailures = ({ comment, dialect, sourceLines }) =>
  isOneLineBlock({ comment, dialect, sourceLines })
    ? [
        {
          line: comment.loc.start.line,
          rule: "one-line-block",
          message: "is a one-line block comment: use // or spread the block over several lines",
        },
      ]
    : [];

const commentFailures = ({ comment, dialect, file, sourceLines }) => {
  if (dialect === "script" && DIRECTIVE[comment.type].test(comment.value)) {
    return [
      {
        line: comment.loc.start.line,
        rule: "directive",
        message: "is an ESLint directive: change the config for the file's glob instead",
      },
    ];
  }

  return [...findCitations(comment, file), ...shapeFailures({ comment, dialect, sourceLines })];
};

const parseFailure = (error) => ({
  line: error.location?.start.line ?? 1,
  rule: "parse-error",
  message: `could not be parsed: ${error.message}`,
});

/*
 * A run of line comments reads as one block, and in YAML it is the only way to write one.
 * A comment sharing its line with code never joins the run above it.
 */
const commentRuns = (comments, sourceLines) => {
  const runs = [];

  for (const comment of comments) {
    const alone = isAloneOnItsLine(comment, sourceLines);
    const open = runs.at(-1);

    if (alone && open?.alone === true && comment.loc.start.line === open.end + 1) {
      open.end = comment.loc.end.line;
      continue;
    }

    runs.push({ alone, end: comment.loc.end.line, start: comment.loc.start.line });
  }

  return runs;
};

const runReports = (comments, sourceLines) =>
  commentRuns(comments, sourceLines)
    .map((run) => ({ length: run.end - run.start + 1, start: run.start }))
    .filter(({ length }) => length > LONG_BLOCK_LINES)
    .map(({ length, start }) => ({
      line: start,
      rule: "long-block",
      message: `starts a ${length}-line comment block`,
    }));

const codeReports = (comment, dialect) => {
  const codeLine = commentLines(comment).find(({ text }) => CODE_LIKE[dialect].test(text));

  if (!codeLine) return [];

  return [{ line: codeLine.line, rule: "commented-code", message: "may be commented-out code" }];
};

const lineRange = ({ start, end }) =>
  Array.from({ length: end.line - start.line + 1 }, (_, offset) => start.line + offset);

const densityReports = ({ comments, sourceLines }) => {
  const nonBlankCount = sourceLines.filter((line) => line.trim() !== "").length;
  const commentLineCount = new Set(comments.flatMap((comment) => lineRange(comment.loc))).size;
  const share = nonBlankCount === 0 ? 0 : commentLineCount / nonBlankCount;

  if (nonBlankCount < DENSITY_MIN_LINES || share <= DENSITY_LIMIT) return [];

  return [
    {
      rule: "density",
      message: `is ${Math.round(share * 100)}% comment lines`,
    },
  ];
};

const isExport = (node) =>
  node.type === "ExportNamedDeclaration" || node.type === "ExportDefaultDeclaration";

const hasDocBlock = (node, comments) =>
  comments.some(
    (comment) =>
      comment.type === "Block" &&
      comment.value.startsWith("*") &&
      comment.loc.end.line === node.loc.start.line - 1,
  );

const docReports = ({ body, comments }) => {
  const exported = body.filter(isExport);
  const documentedCount = exported.filter((node) => hasDocBlock(node, comments)).length;
  const isEverywhere =
    exported.length >= DOC_MIN_EXPORTS && documentedCount / exported.length >= DOC_SHARE_LIMIT;

  if (!isEverywhere) return [];

  return [
    {
      rule: "doc-everywhere",
      message: `${documentedCount} of ${exported.length} exports carry a doc block`,
    },
  ];
};

// Only a script has exports to carry a doc block, so only a script is asked about them.
const inspectRead = ({ body, comments, dialect, file, sourceLines }) => ({
  failures: comments.flatMap((comment) => commentFailures({ comment, dialect, file, sourceLines })),
  reports: [
    ...runReports(comments, sourceLines),
    ...comments.flatMap((comment) => codeReports(comment, dialect)),
    ...densityReports({ comments, sourceLines }),
    ...(body === null ? [] : docReports({ body, comments })),
  ],
});

export const inspectComments = ({ code, file }) => {
  const { body, comments, dialect, error } = readComments({ code, file });

  if (error) return { failures: [parseFailure(error)], reports: [] };

  return inspectRead({ body, comments, dialect, file, sourceLines: code.split("\n") });
};
