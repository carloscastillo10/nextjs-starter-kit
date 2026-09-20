import { fsdRoots, workspaceOf } from "./fsd-roots.js";

const PUBLIC_API = "/index(\\.server)?\\.(ts|tsx|js|jsx|mjs)$";

const interiorOf = (root) => `^${root}/`;

const sharedRoots = fsdRoots.filter((root) => !root.startsWith("apps/"));

const publicApiRules = sharedRoots.map((root) => ({
  name: `no-import-past-${workspaceOf(root).replace("/", "-")}-public-api`,
  comment: `${root} is an FSD root shared between apps. Import it through a public API: the package exports name the slice or segment, and the file behind that name is its index.`,
  severity: "error",
  from: { path: "^(apps|packages)/", pathNot: `^${workspaceOf(root)}/` },
  to: { path: interiorOf(root), pathNot: PUBLIC_API },
}));

export default {
  forbidden: [
    {
      name: "no-circular",
      comment:
        "A cycle makes both modules impossible to read, test or delete on their own. Move what they share to a third module, or merge them.",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "packages-do-not-import-apps",
      comment:
        "An app knows the packages it builds on; a package knows no app. Pass what the app owns in as an argument, or move the shared part into a package of its own.",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^apps/" },
    },
    {
      name: "apps-do-not-import-each-other",
      comment:
        "Two apps share code through a package, never by reaching into each other, which would make them one deployment.",
      severity: "error",
      from: { path: "^apps/([^/]+)/" },
      to: { path: "^apps/", pathNot: "^apps/$1/" },
    },
    {
      name: "tooling-does-not-import-the-product",
      comment:
        "Tooling configures the build for every workspace. Importing an app or a package would make the checks depend on what they check.",
      severity: "error",
      from: { path: "^tooling/" },
      to: { path: "^(apps|packages)/" },
    },
    ...publicApiRules,
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "(^|/)(\\.next|\\.turbo|dist|node_modules)/" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "types"],
    },
  },
};
