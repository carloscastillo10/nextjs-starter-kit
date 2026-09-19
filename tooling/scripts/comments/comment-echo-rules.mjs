import { isCheckedSource } from "./comment-rules.mjs";

/*
 * Short enough that a copied sentence lands on it, long enough that two people writing
 * about the same subject do not: a shared run this long is a paste, not a coincidence.
 */
export const ECHOED_WORDS = 8;

const PROSE_FILE = /\.mdx?$/u;

const DIFF_HEADER = /^\+\+\+ b\/(?<file>.*)$/u;

const BLOCK_OPENS = /^\s*\/\*/u;

const LINE_COMMENT = /^\s*\/\//u;

const wordsIn = (line) =>
  line
    .toLowerCase()
    .replaceAll(/`[^`]*`/gu, " ")
    .replaceAll(/[^a-z0-9]+/gu, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

const shinglesOf = (words) => {
  const out = new Set();

  for (let start = 0; start + ECHOED_WORDS <= words.length; start += 1) {
    out.add(words.slice(start, start + ECHOED_WORDS).join(" "));
  }

  return out;
};

const commentText = (line) =>
  line
    .replace(/^\s*\/\*+/u, "")
    .replace(/\*+\/\s*$/u, "")
    .replace(/^\s*\*\s?/u, "")
    .replace(/^\s*\/\/+\s?/u, "");

const kindOf = (file) => {
  if (isCheckedSource(file)) return "source";

  return PROSE_FILE.test(file) ? "prose" : "";
};

const readAdded = (diff) => {
  const comments = [];
  const prose = [];
  let kind = "";
  let file = "";
  let inBlock = false;

  for (const line of diff.split("\n")) {
    const header = DIFF_HEADER.exec(line);

    if (header !== null) {
      file = header.groups.file;
      kind = kindOf(file);
      inBlock = false;
      continue;
    }

    if (!line.startsWith("+") || line.startsWith("+++")) continue;

    const body = line.slice(1);

    if (kind === "prose") {
      prose.push(...wordsIn(body));
      continue;
    }

    if (kind !== "source") continue;

    const opens = BLOCK_OPENS.test(body);

    if (inBlock || opens) {
      comments.push({ file, text: commentText(body) });
      inBlock = !body.includes("*/");
      continue;
    }

    if (LINE_COMMENT.test(body)) comments.push({ file, text: commentText(body) });
  }

  return { comments, prose };
};

export const findEchoes = (diff) => {
  const { comments, prose } = readAdded(diff);
  const written = shinglesOf(prose);
  const seen = new Set();
  const echoes = [];

  for (const { file, text } of comments) {
    if (seen.has(file)) continue;

    const shingle = [...shinglesOf(wordsIn(text))].find((candidate) => written.has(candidate));

    if (shingle !== undefined) {
      seen.add(file);
      echoes.push({ file, shingle });
    }
  }

  return { commentCount: comments.length, echoes };
};
