import { parse as parseScript } from "@typescript-eslint/typescript-estree";
import { parse as parseYaml, Parser as YamlParser } from "yaml";

const DIALECT_BY_EXTENSION = [
  { dialect: "script", pattern: /\.[cm]?[jt]sx?$/u },
  { dialect: "yaml", pattern: /\.ya?ml$/u },
  { dialect: "jsonc", pattern: /\.(?:jsonc|json5)$/u },
  { dialect: "css", pattern: /\.css$/u },
];

const SKIPPED_FILE =
  /(?:^|\/)(?:node_modules|\.next|\.turbo|dist|build|coverage|\.claude|\.agents)\/|\.d\.[cm]?ts$|(?:^|\/)pnpm-lock\.yaml$/u;

const JSX_ALLOWED = /\.(?:[cm]?js|[jt]sx)$/u;

export const dialectOf = (file) => {
  if (SKIPPED_FILE.test(file)) return null;

  return DIALECT_BY_EXTENSION.find(({ pattern }) => pattern.test(file))?.dialect ?? null;
};

const lineStarts = (code) => {
  const starts = [0];

  for (let at = 0; at < code.length; at += 1) {
    if (code[at] === "\n") starts.push(at + 1);
  }

  return starts;
};

const positionAt = (starts, offset) => {
  let low = 0;
  let high = starts.length - 1;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);

    if (starts[middle] <= offset) {
      low = middle;
      continue;
    }

    high = middle - 1;
  }

  return { column: offset - starts[low], line: low + 1 };
};

const spanOf = (starts, from, to) => ({
  end: positionAt(starts, to),
  start: positionAt(starts, from),
});

const readScript = ({ code, file }) => {
  const ast = parseScript(code, {
    comment: true,
    jsx: JSX_ALLOWED.test(file),
    loc: true,
    range: true,
  });

  return { body: ast.body, comments: ast.comments };
};

const yamlCommentTokens = (tokens) => {
  const found = [];

  const walk = (token) => {
    if (token === null || typeof token !== "object") return;

    if (Array.isArray(token)) {
      token.forEach(walk);

      return;
    }

    if (token.type === "comment") found.push(token);

    Object.values(token).forEach(walk);
  };

  walk(tokens);

  return found.sort((one, other) => one.offset - other.offset);
};

/*
 * The real parser rather than a hash at the start of a line: only it tells a comment from a
 * hash inside a quoted string or inside a block scalar, where the text is data.
 */
const readYaml = ({ code }) => {
  parseYaml(code);

  const starts = lineStarts(code);
  const comments = yamlCommentTokens([...new YamlParser().parse(code)]).map((token) => ({
    loc: spanOf(starts, token.offset, token.offset + token.source.length),
    type: "Line",
    value: token.source.slice(1),
  }));

  return { body: null, comments };
};

const QUOTES = new Set(['"', "'"]);

const skipString = (code, at) => {
  const quote = code[at];
  let cursor = at + 1;

  while (cursor < code.length && code[cursor] !== quote) cursor += code[cursor] === "\\" ? 2 : 1;

  return cursor + 1;
};

const lineCommentAt = (code, starts, at) => {
  const newline = code.indexOf("\n", at);
  const end = newline === -1 ? code.length : newline;

  return {
    at: end,
    comment: { loc: spanOf(starts, at, end), type: "Line", value: code.slice(at + 2, end) },
  };
};

const blockCommentAt = (code, starts, at) => {
  const closes = code.indexOf("*/", at + 2);

  if (closes === -1) throw new Error(`a block comment opened at offset ${at} and never closed`);

  return {
    at: closes + 2,
    comment: {
      loc: spanOf(starts, at, closes + 2),
      type: "Block",
      value: code.slice(at + 2, closes),
    },
  };
};

const stepFrom = ({ at, code, hasLineComments, starts }) => {
  if (QUOTES.has(code[at])) return { at: skipString(code, at) };

  if (code[at] !== "/") return { at: at + 1 };

  if (hasLineComments && code[at + 1] === "/") return lineCommentAt(code, starts, at);

  if (code[at + 1] === "*") return blockCommentAt(code, starts, at);

  return { at: at + 1 };
};

/*
 * JSON with comments and CSS have no parser here, so the comments are scanned out. Tracking
 * the string state is the whole job: a URL is what a plain search for two slashes trips on.
 */
const scanCLike = ({ code, hasLineComments }) => {
  const starts = lineStarts(code);
  const comments = [];
  let at = 0;

  while (at < code.length) {
    const step = stepFrom({ at, code, hasLineComments, starts });

    if (step.comment !== undefined) comments.push(step.comment);

    at = step.at;
  }

  return { body: null, comments };
};

const READERS = {
  css: ({ code }) => scanCLike({ code, hasLineComments: false }),
  jsonc: ({ code }) => scanCLike({ code, hasLineComments: true }),
  script: readScript,
  yaml: readYaml,
};

export const readComments = ({ code, file }) => {
  const dialect = dialectOf(file);

  if (dialect === null) return { body: null, comments: [], dialect };

  try {
    return { ...READERS[dialect]({ code, file }), dialect };
  } catch (error) {
    return { body: null, comments: [], dialect, error };
  }
};
