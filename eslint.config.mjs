import { base } from "@repo/eslint-config/base";
import { defineConfig } from "eslint/config";

/*
 * Covers the files at the root of the repository. Each workspace package has its own
 * config, which ESLint picks for the files below it.
 */
export default defineConfig([
  base,
  {
    /*
     * plop, which `turbo gen` runs, calls the default export of the file it finds, and
     * the file name is fixed, so it does not match the `*.config.*` exemption.
     */
    name: "root/generator",
    files: ["turbo/generators/config.mjs"],
    rules: { "no-restricted-exports": "off" },
  },
]);
