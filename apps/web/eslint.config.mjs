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
    /*
     * The Tailwind rules resolve Tailwind and the theme from these paths. Absolute paths
     * give the same result whether ESLint runs in the app or at the repository root.
     */
    settings: {
      "better-tailwindcss": {
        cwd: import.meta.dirname,
        entryPoint: path.join(import.meta.dirname, "src/_app/styles/globals.css"),
      },
    },
  },
]);
