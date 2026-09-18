import nextPlugin from "@next/eslint-plugin-next";

import { closing, codeStyle, fileNamingRule, MODULE_FILE_NAMES } from "./base.js";
import { reactBlocks } from "./react.js";
import { BASE_SYNTAX, COMPONENT_SYNTAX, SLICE_UI_SYNTAX } from "./syntax.js";

const SLICE_UI_FILES = ["src/{_pages,widgets,features,entities}/**/ui/**/*.tsx"];

const ROUTE_FILES = ["app/**/*.{ts,tsx}"];

const ROUTE_FILE_IMPORTS = [
  {
    regex: "^@/(?!_pages(/|$)|_app(/|$))",
    message: "Route files import only from @/_pages/* and @/_app/*.",
  },
  {
    regex: "^@/.+/(ui|model|api|lib|config)(/|$)",
    message: "Import a slice through its public API (index.ts).",
  },
  {
    group: ["./*", "../*"],
    message: "Route files re-export from src through the @/ alias.",
  },
];

const nextBlocks = [
  nextPlugin.configs["core-web-vitals"],
  {
    name: "@repo/eslint-config/next/app-router",
    /*
     * The rule checks links against a Pages Router directory. An App Router app has
     * none, so the rule only warns that it cannot find one.
     */
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  {
    name: "@repo/eslint-config/next/file-names",
    rules: {
      "check-file/filename-naming-convention": fileNamingRule({
        "**/src/**/*.tsx": "PASCAL_CASE",
        "**/app/**/*.tsx": "KEBAB_CASE",
        ...MODULE_FILE_NAMES,
      }),
    },
  },
  {
    name: "@repo/eslint-config/next/slice-ui",
    files: SLICE_UI_FILES,
    rules: {
      "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...COMPONENT_SYNTAX, ...SLICE_UI_SYNTAX],
    },
  },
  {
    name: "@repo/eslint-config/next/route-files",
    files: ROUTE_FILES,
    rules: {
      "no-restricted-exports": "off",
      "no-restricted-imports": ["error", { patterns: ROUTE_FILE_IMPORTS }],
    },
  },
  {
    name: "@repo/eslint-config/next/steiger-config",
    files: ["steiger.config.ts"],
    /*
     * The type declarations of the Feature-Sliced Design plugin for Steiger import a
     * package that is not published, so its exports reach this file typed as `any`.
     */
    rules: {
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
];

export const next = [...codeStyle, ...reactBlocks, ...nextBlocks, ...closing];
