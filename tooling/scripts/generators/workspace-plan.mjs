export const WORKSPACE_KINDS = ["packages", "tooling"];

const NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u;

const KIND_EMOJI = { packages: "📦", tooling: "🛠️" };

const KIND_LABEL = { packages: "package", tooling: "tooling" };

const FILES = [
  ["package.json.hbs", "package.json"],
  ["tsconfig.json.hbs", "tsconfig.json"],
  ["eslint.config.mjs.hbs", "eslint.config.mjs"],
  ["vitest.config.mts.hbs", "vitest.config.mts"],
  ["cspell.json.hbs", "cspell.json"],
  ["prettierignore.hbs", ".prettierignore"],
  ["README.md.hbs", "README.md"],
];

const LAYERED_ENTRY = "src/shared/lib";

const reject = (reason) => {
  throw new Error(`pnpm new: ${reason}`);
};

export const isWorkspaceName = (value) => typeof value === "string" && NAME.test(value);

const check = ({ kind, layers, name, summary }) => {
  if (!WORKSPACE_KINDS.includes(kind)) {
    reject(`a workspace goes under ${WORKSPACE_KINDS.join(", ")}, not "${kind}".`);
  }

  if (!isWorkspaceName(name)) {
    reject(`"${name}" is not a folder name: lower case letters, digits, single hyphens.`);
  }

  if (typeof summary !== "string" || summary.trim() === "") {
    reject("the summary is the line under the README title, so it cannot be empty.");
  }

  if (layers && kind !== "packages") {
    reject("only a package holds FSD layers, because the apps import them from it.");
  }
};

/**
 * Turns the answers into the files the generator writes and the data its templates
 * render, so the generator itself stays a list of `add` actions.
 */
export const planWorkspace = ({ kind, layers = false, name, summary }) => {
  check({ kind, layers, name, summary });

  const folder = `${kind}/${name}`;
  const packageName = `@repo/${name}`;
  const entry = layers ? `${LAYERED_ENTRY}/index.ts` : "src/index.ts";

  const data = {
    emoji: KIND_EMOJI[kind],
    entry: layers ? `${packageName}/shared/lib` : packageName,
    kind,
    layers,
    name,
    packageName,
    summary: summary.trim(),
    typeLabel: KIND_LABEL[kind],
  };

  const files = [...FILES, ["index.ts.hbs", entry]].map(([template, target]) => ({
    path: `${folder}/${target}`,
    templateFile: `templates/${template}`,
  }));

  return { data, files, folder, fsdRoot: layers ? `${folder}/src` : null };
};
