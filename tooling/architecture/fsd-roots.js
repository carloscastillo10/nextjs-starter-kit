import document from "./fsd-roots.json" with { type: "json" };

const WORKSPACE = /^(?:apps|packages|tooling)\/[^/]+\/.+$/u;

const reject = (reason) => {
  throw new Error(`fsd-roots.json: ${reason}`);
};

const check = (root, seen) => {
  if (typeof root !== "string") reject(`${JSON.stringify(root)} is not a path.`);
  if (root.includes("\\")) reject(`"${root}" has to use forward slashes.`);
  if (root.endsWith("/")) reject(`"${root}" has a trailing slash.`);

  if (root.startsWith("/") || root.split("/").includes("..")) {
    reject(`"${root}" has to be relative to the repository root and stay under it.`);
  }

  if (!WORKSPACE.test(root)) {
    reject(`"${root}" has to sit inside apps, packages or tooling, as <workspace>/<folder>.`);
  }

  if (seen.has(root)) reject(`"${root}" is listed twice.`);
};

export const readFsdRoots = (source) => {
  const roots = source?.roots;

  if (!Array.isArray(roots)) reject("expected a list of FSD roots under `roots`.");
  if (roots.length === 0) reject("expected at least one FSD root.");

  const seen = new Set();

  for (const root of roots) {
    check(root, seen);
    seen.add(root);
  }

  return [...roots];
};

export const fsdRoots = readFsdRoots(document);

export const workspaceOf = (root) => root.split("/").slice(0, 2).join("/");
