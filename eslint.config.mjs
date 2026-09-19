import { base } from "@repo/eslint-config/base";
import { defineConfig } from "eslint/config";

/*
 * Covers the files at the root of the repository. Each workspace package has its own
 * config, which ESLint picks for the files below it.
 */
export default defineConfig([base]);
