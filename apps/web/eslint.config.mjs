import { next } from "@repo/eslint-config/next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  next,
  {
    name: "web/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
]);
