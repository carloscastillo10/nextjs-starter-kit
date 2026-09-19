import { readFileSync, writeFileSync } from "node:fs";

import { readFsdRoots } from "@repo/architecture-config/fsd-roots";

export const FSD_ROOTS_FILE = "tooling/architecture/fsd-roots.json";

/**
 * Adds a root to the list both architecture linters read. `readFsdRoots` runs twice:
 * on the list as it stands, and on the result, so a root this rejects never reaches
 * the file.
 */
export const withFsdRoot = (document, root) => {
  const roots = readFsdRoots(document);

  if (roots.includes(root)) throw new Error(`fsd-roots.json: "${root}" is already listed.`);

  const next = { ...document, roots: [...roots, root].sort() };

  readFsdRoots(next);

  return next;
};

export const registerFsdRoot = ({ file, root }) => {
  const next = withFsdRoot(JSON.parse(readFileSync(file, "utf8")), root);

  writeFileSync(file, `${JSON.stringify(next, null, 2)}\n`);

  return next.roots;
};
