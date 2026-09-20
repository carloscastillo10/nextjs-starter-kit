import path from "node:path";

import { next } from "@repo/eslint-config/next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  next,
  {
    name: "web/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
  {
    name: "web/tailwind",
    // Absolute, so the rules find the same theme from the app and from the repository root.
    settings: {
      "better-tailwindcss": {
        cwd: import.meta.dirname,
        entryPoint: path.join(import.meta.dirname, "src/_app/styles/globals.css"),
      },
    },
  },
]);
