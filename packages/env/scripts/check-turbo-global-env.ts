import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findRepoRoot } from "../src/loading/repo-root";
import { checkGlobalEnv, declaredVariableNames, GLOBAL_ENV_KEY } from "./turbo-global-env";

const TURBO_FILE = "turbo.json";

const fail = (message: string): never => {
  console.error(`check-turbo-global-env: ${message}`);
  process.exit(1);
};

const source = readFileSync(join(findRepoRoot(), TURBO_FILE), "utf8");
const result = checkGlobalEnv(JSON.parse(source), declaredVariableNames());

if (result.kind === "key-not-found") fail(`could not find "${GLOBAL_ENV_KEY}" in ${TURBO_FILE}`);

if (result.kind === "missing-variables") {
  fail(
    [
      `${TURBO_FILE} does not declare: ${result.missing.join(", ")}.`,
      "Turborepo runs in strict mode, so an undeclared variable is stripped from every task and",
      "a value exported in the shell is silently ignored.",
    ].join(" "),
  );
}

console.warn(`check-turbo-global-env: ${TURBO_FILE} declares every variable the schemas read.`);
