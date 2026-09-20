import { readFileSync, writeFileSync } from "node:fs";

import { readFsdRoots } from "@repo/architecture-config/fsd-roots";

export const FSD_ROOTS_FILE = "tooling/architecture/fsd-roots.json";

// `readFsdRoots` runs on the list and on the result, so a root it rejects never lands.
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
