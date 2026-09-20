import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { fsdRoots } from "@repo/architecture-config/fsd-roots";

const repositoryRoot = fileURLToPath(new URL("../../..", import.meta.url));

export const lintFsdRoots = ({ roots, run }) => {
  if (roots.length === 0) throw new Error("lint-fsd: no FSD roots to lint.");

  const failed = [];

  for (const root of roots) {
    if (run(root) !== 0) failed.push(root);
  }

  return { failed, status: failed.length > 0 ? 1 : 0 };
};

// Steiger finds its config by searching upwards from the working directory, one folder a run.
const steiger = (root) => {
  const { error, status } = spawnSync(
    path.join(repositoryRoot, "node_modules", ".bin", "steiger"),
    [root],
    { cwd: repositoryRoot, stdio: "inherit" },
  );

  if (error) process.stderr.write(`lint-fsd: ${error.message}\n`);

  return status;
};

const main = () => {
  const announce = (root) => {
    if (fsdRoots.length > 1) process.stdout.write(`\n──── ${root} ────\n\n`);

    return steiger(root);
  };

  const { failed, status } = lintFsdRoots({ roots: fsdRoots, run: announce });

  if (failed.length > 0) {
    process.stderr.write(`\nlint-fsd: ${failed.join(", ")} did not pass.\n`);
  }

  return status;
};

if (import.meta.main) process.exitCode = main();
