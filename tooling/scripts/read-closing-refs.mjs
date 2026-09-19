import { fileURLToPath } from "node:url";

const CLOSING = /\b(?:close[sd]?|fix(?:e[sd])?|resolve[sd]?)\s+#(?<issue>\d+)\b/giu;

/*
 * GitHub acts on a keyword inside a blockquote and ignores one inside code, so a body that
 * shows the convention in an example does not close whatever issue the example names.
 */
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
