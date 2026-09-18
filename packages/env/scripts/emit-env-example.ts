import { emitEnvExample } from "../src/example/env-example.emitter";
import { findRepoRoot } from "../src/loading/repo-root";
import { ENV_SCHEMAS } from "../src/schemas";

const path = emitEnvExample(findRepoRoot(), ENV_SCHEMAS);

console.warn(`emit-env-example: wrote ${path}`);
