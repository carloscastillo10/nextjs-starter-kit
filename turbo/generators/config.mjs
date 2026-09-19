import { spawnSync } from "node:child_process";
import path from "node:path";

import { FSD_ROOTS_FILE, registerFsdRoot } from "@repo/scripts/register-fsd-root";
import { isWorkspaceName, planWorkspace } from "@repo/scripts/workspace-plan";

const KIND_CHOICES = [
  { name: "packages: code an app imports", value: "packages" },
  { name: "tooling: configuration the workspaces share", value: "tooling" },
];

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

const registerRoot = (plan) => (_answers, _config, plop) => {
  const file = path.join(plop.getDestBasePath(), FSD_ROOTS_FILE);
  const roots = registerFsdRoot({ file, root: plan.fsdRoot });

  return `${plan.fsdRoot} joins ${FSD_ROOTS_FILE}, which now lists ${roots.length} FSD roots`;
};

/*
 * The templates are written for a reader, not for Prettier, and the answers change the
 * width of what they render. Formatting the result is what keeps `pnpm format` green
 * whoever edits a template.
 */
const format = (plan) => (_answers, _config, plop) => {
  const base = plop.getDestBasePath();
  const targets = [plan.folder, ...(plan.fsdRoot ? [FSD_ROOTS_FILE] : [])];
  const prettier = path.join(base, "node_modules", ".bin", "prettier");
  const { error, status } = spawnSync(prettier, ["--write", "--log-level", "warn", ...targets], {
    cwd: base,
    stdio: "inherit",
  });

  if (error || status !== 0) {
    throw new Error(`Prettier did not format ${targets.join(" ")}. Run pnpm format:fix.`);
  }

  return `${targets.join(", ")} formatted`;
};

export default (plop) => {
  plop.setGenerator("new-workspace", {
    actions: (answers) => {
      const plan = planWorkspace(answers ?? {});

      return [
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
