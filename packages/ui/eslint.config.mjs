import { react } from "@repo/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  react,
  {
    name: "ui/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
]);
