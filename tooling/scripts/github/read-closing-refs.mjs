import { fileURLToPath } from "node:url";

const CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(?<issue>\d+)\b/giu;

// GitHub acts on a keyword in a blockquote and ignores one in code, so an example closes nothing.
export const readClosingRefs = (body) => {
  const prose = (body ?? "")
    .replaceAll(/```[\s\S]*?```/gu, " ")
    .replaceAll(/~~~[\s\S]*?~~~/gu, " ")
    .replaceAll(/`[^`\n]*`/gu, " ");

  return [...new Set([...prose.matchAll(CLOSING)].map((match) => Number(match.groups.issue)))];
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${readClosingRefs(process.env.PR_BODY ?? process.argv[2]).join(" ")}\n`);
}
