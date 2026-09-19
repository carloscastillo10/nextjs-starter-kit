import nextPlugin from "@next/eslint-plugin-next";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";

import { closing, codeStyle, fileNamingRule, MODULE_FILE_NAMES } from "./base.js";
import { reactBlocks } from "./react.js";
import { BASE_SYNTAX, COMPONENT_SYNTAX, SLICE_UI_SYNTAX, UI_KIT_SYNTAX } from "./syntax.js";

const SOURCE_FILES = ["src/**/*.{ts,tsx}"];

const SOURCE_COMPONENT_FILES = ["src/**/*.tsx"];

/*
 * An arbitrary value closes the class, as in `w-[123px]`, `bg-[#fff]/50` or `p-[1rem]!`.
 * Anchoring the pattern there leaves arbitrary variants such as `data-[state=open]:`
 * alone, and a `calc()` stays allowed for a computed size that has no step on the scale.
 */
const ARBITRARY_VALUE = "-\\[(?!calc\\()[^\\]]*\\](?:\\/[^/]+)?!?$";

const KIT_COMPONENT_FILES = ["src/shared/ui/**/*.tsx"];

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
    /*
     * The shadcn CLI writes kebab case, and a primitive dropped here is its output with
     * the imports rewritten. Renaming it costs the next `add --diff` its match.
     */
    name: "@repo/eslint-config/next/kit-file-names",
    files: KIT_COMPONENT_FILES,
    rules: {
      "check-file/filename-naming-convention": fileNamingRule({
        "**/*.tsx": "KEBAB_CASE",
        ...MODULE_FILE_NAMES,
      }),
    },
  },
  {
    name: "@repo/eslint-config/next/ui-kit",
    files: SOURCE_COMPONENT_FILES,
    rules: {
      "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...COMPONENT_SYNTAX, ...UI_KIT_SYNTAX],
    },
  },
  {
    name: "@repo/eslint-config/next/slice-ui",
    files: SLICE_UI_FILES,
    rules: {
      "no-restricted-syntax": [
        "error",
        ...BASE_SYNTAX,
        ...COMPONENT_SYNTAX,
        ...UI_KIT_SYNTAX,
        ...SLICE_UI_SYNTAX,
      ],
    },
  },
  {
    name: "@repo/eslint-config/next/tailwind",
    files: SOURCE_FILES,
    /*
     * The rules read the theme through the app's global styles, which each app names in
     * the `better-tailwindcss` settings of its own config.
     */
    plugins: { "better-tailwindcss": betterTailwindcss },
    rules: {
      "better-tailwindcss/enforce-canonical-classes": "error",
      "better-tailwindcss/enforce-consistent-variable-syntax": "error",
      "better-tailwindcss/no-conflicting-classes": "error",
      "better-tailwindcss/no-deprecated-classes": "error",
      "better-tailwindcss/no-restricted-classes": [
        "error",
        {
          restrict: [
            {
              pattern: ARBITRARY_VALUE,
              message: "Use a theme token instead of an arbitrary value.",
            },
          ],
        },
      ],
      "better-tailwindcss/no-unknown-classes": "error",
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
