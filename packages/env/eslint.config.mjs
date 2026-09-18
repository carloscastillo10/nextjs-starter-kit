import { base } from "@repo/eslint-config/base";
import { defineConfig } from "eslint/config";

export default defineConfig([
  base,
  {
    name: "env/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
]);
