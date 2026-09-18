import path from "node:path";

import { parse } from "@typescript-eslint/typescript-estree";

const SOURCE_FILE = /\.[cm]?[jt]sx?$/u;

const SKIPPED_FILE =
  /(?:^|\/)(?:node_modules|\.next|\.turbo|dist|build|coverage|\.claude|\.agents)\/|\.d\.[cm]?ts$/u;

const JSX_ALLOWED = /\.(?:[cm]?js|[jt]sx)$/u;

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

const CODE_LIKE = /^(?:import|export|const|let|var|return|if|for|await|function)\b|[;{}]$|\);$/u;

const DENSITY_LIMIT = 0.4;

const DENSITY_MIN_LINES = 20;

const LONG_BLOCK_LINES = 12;

const DOC_SHARE_LIMIT = 0.6;

const DOC_MIN_EXPORTS = 3;

export const isCheckedSource = (file) => SOURCE_FILE.test(file) && !SKIPPED_FILE.test(file);

const parseSource = ({ code, file }) =>
  parse(code, { comment: true, loc: true, range: true, jsx: JSX_ALLOWED.test(file) });

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
  const lineText = sourceLines[comment.loc.start.line - 1] ?? "";
  const before = lineText.slice(0, comment.loc.start.column);
  const after = lineText.slice(comment.loc.end.column);

  return before.trim() === "" && after.trim() === "";
};

const isOneLineBlock = (comment, sourceLines) =>
  comment.type === "Block" &&
  comment.loc.start.line === comment.loc.end.line &&
  !BUNDLER_ANNOTATION.test(comment.value) &&
  isAloneOnItsLine(comment, sourceLines);

const shapeFailures = (comment, sourceLines) =>
  isOneLineBlock(comment, sourceLines)
    ? [
        {
          line: comment.loc.start.line,
          rule: "one-line-block",
          message: "is a one-line block comment: use // or spread the block over several lines",
        },
      ]
    : [];

const commentFailures = ({ comment, file, sourceLines }) => {
  if (DIRECTIVE[comment.type].test(comment.value)) {
    return [
      {
        line: comment.loc.start.line,
        rule: "directive",
        message: "is an ESLint directive: change the config for the file's glob instead",
      },
    ];
  }

  return [...findCitations(comment, file), ...shapeFailures(comment, sourceLines)];
};

const parseFailure = (error) => ({
  line: error.location?.start.line ?? 1,
  rule: "parse-error",
  message: `could not be parsed: ${error.message}`,
});

const blockReports = (comment) => {
  const lineCount = comment.loc.end.line - comment.loc.start.line + 1;

  if (comment.type !== "Block" || lineCount <= LONG_BLOCK_LINES) return [];

  return [
    {
      line: comment.loc.start.line,
      rule: "long-block",
      message: `starts a ${lineCount}-line comment block`,
    },
  ];
};

const codeReports = (comment) => {
  const codeLine = commentLines(comment).find(({ text }) => CODE_LIKE.test(text));

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
      message: `${Math.round(share * 100)}% of the non-blank lines are comments`,
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

const inspectParsed = ({ code, file, ast }) => {
  const sourceLines = code.split("\n");
  const { body, comments } = ast;

  return {
    failures: comments.flatMap((comment) => commentFailures({ comment, file, sourceLines })),
    reports: [
      ...comments.flatMap((comment) => [...blockReports(comment), ...codeReports(comment)]),
      ...densityReports({ comments, sourceLines }),
      ...docReports({ body, comments }),
    ],
  };
};

const tryParse = ({ code, file }) => {
  try {
    return { ast: parseSource({ code, file }) };
  } catch (error) {
    return { error };
  }
};

export const inspectComments = ({ code, file }) => {
  const { ast, error } = tryParse({ code, file });

  if (error) return { failures: [parseFailure(error)], reports: [] };

  return inspectParsed({ code, file, ast });
};
