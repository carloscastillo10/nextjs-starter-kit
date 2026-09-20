import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

import { FSD_ROOTS_FILE, registerFsdRoot } from "@repo/scripts/register-fsd-root";
import { isWorkspaceName, planWorkspace, WORKSPACE_KINDS } from "@repo/scripts/workspace-plan";

const KIND_HELP = {
  packages: "code an app imports",
  tooling: "configuration the workspaces share",
};

const KIND_CHOICES = WORKSPACE_KINDS.map((kind) => ({
  name: `${kind}: ${KIND_HELP[kind]}`,
  value: kind,
}));

const PROMPTS = [
  { choices: KIND_CHOICES, message: "Where does it go?", name: "kind", type: "list" },
  {
    message: "Name without the @repo scope, for example metrics",
    name: "name",
    type: "input",
    validate: (value) => isWorkspaceName(value) || "lower case letters, digits and single hyphens",
  },
  {
    message: "One sentence: what it holds and who imports it",
    name: "summary",
    type: "input",
    validate: (value) => value.trim() !== "" || "it becomes the line under the README title",
  },
  {
    default: false,
    message: "Does it hold Feature-Sliced Design layers shared between apps? (packages only)",
    name: "layers",
    type: "confirm",
  },
];

const write = (plan) =>
  plan.files.map(({ path: target, templateFile }) => ({
    data: plan.data,
    path: target,
    templateFile,
    type: "add",
  }));

// Without this, a name already taken fails halfway and leaves half a workspace behind.
const refuseTakenFolder = (plan) => (_answers, _config, plop) => {
  if (existsSync(path.join(plop.getDestBasePath(), plan.folder))) {
    throw new Error(`${plan.folder} already exists. Pick another name, or delete it first.`);
  }

  return `${plan.folder} is free`;
};

const registerRoot = (plan) => (_answers, _config, plop) => {
  const file = path.join(plop.getDestBasePath(), FSD_ROOTS_FILE);
  const roots = registerFsdRoot({ file, root: plan.fsdRoot });

  return `${plan.fsdRoot} joins ${FSD_ROOTS_FILE}, which now lists ${roots.length} FSD roots`;
};

// The templates are laid out for a reader, and the answers change the width they render.
const format = (plan) => (_answers, _config, plop) => {
  const base = plop.getDestBasePath();
  const targets = [plan.folder, ...(plan.fsdRoot === null ? [] : [FSD_ROOTS_FILE])];
  const prettier = path.join(base, "node_modules", ".bin", "prettier");
  const { error, status } = spawnSync(prettier, ["--write", "--log-level", "warn", ...targets], {
    cwd: base,
    stdio: "inherit",
  });

  if (error || status !== 0) {
    throw new Error(
      `Prettier did not format ${targets.join(" ")}. Run pnpm install, then pnpm format:fix.`,
    );
  }

  return `${targets.join(", ")} formatted`;
};

export default (plop) => {
  plop.setGenerator("new-workspace", {
    actions: (answers) => {
      const plan = planWorkspace(answers ?? {});

      return [
        refuseTakenFolder(plan),
        ...write(plan),
        ...(plan.fsdRoot === null ? [] : [registerRoot(plan)]),
        format(plan),
        () => `Run pnpm install, then say in ${plan.folder}/README.md what the workspace owns`,
      ];
    },
    description: "Create a workspace with its scripts, its configs and its README",
    prompts: PROMPTS,
  });
};
