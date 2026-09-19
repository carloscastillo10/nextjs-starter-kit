import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import prettier from "eslint-config-prettier";
import checkFile from "eslint-plugin-check-file";
import perfectionist from "eslint-plugin-perfectionist";
import preferArrowFunctions from "eslint-plugin-prefer-arrow-functions";
import globals from "globals";
import tseslint from "typescript-eslint";

import { BASE_SYNTAX } from "./syntax.js";

const JAVASCRIPT_FILES = ["**/*.{js,mjs,cjs}"];

/*
 * A tool that fixes the name of the file it reads, such as plop for the generators, leaves
 * no room for the `<tool>.config` spelling, so a file named `config` counts as one too.
 */
const CONFIG_FILES = ["**/*.config.{ts,mts,cts,js,mjs,cjs}", "**/config.{ts,mts,cts,js,mjs,cjs}"];

export const MODULE_FILE_NAMES = { "**/*.{ts,mts,cts,js,mjs,cjs}": "KEBAB_CASE" };

export const fileNamingRule = (patterns) => ["error", patterns, { ignoreMiddleExtensions: true }];

const NAMING_WITHOUT_TYPES = [
  {
    selector: "default",
    format: ["camelCase"],
    leadingUnderscore: "forbid",
    trailingUnderscore: "forbid",
  },
  { selector: "import", format: ["camelCase", "PascalCase"] },
  { selector: "variable", format: ["camelCase", "PascalCase", "UPPER_CASE"] },
  { selector: "variable", modifiers: ["destructured"], format: null },
  { selector: "function", format: ["camelCase", "PascalCase"] },
  { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
  { selector: "parameter", modifiers: ["destructured"], format: null },
  { selector: "typeLike", format: ["PascalCase"] },
  { selector: ["objectLiteralProperty", "typeProperty"], format: null },
];

const BOOLEAN_NAMING = {
  selector: "variable",
  types: ["boolean"],
  format: ["PascalCase"],
  prefix: ["is", "has", "should", "can", "did", "will"],
};

const PADDING_LINES = [
  { blankLine: "always", prev: "directive", next: "*" },
  { blankLine: "any", prev: "directive", next: "directive" },
  { blankLine: "always", prev: "import", next: "*" },
  { blankLine: "any", prev: "import", next: "import" },
  { blankLine: "always", prev: "*", next: "return" },
  { blankLine: "always", prev: ["const", "let"], next: "*" },
  { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
  { blankLine: "always", prev: "*", next: ["if", "for", "while", "do", "try"] },
  { blankLine: "any", prev: "if", next: "if" },
  { blankLine: "always", prev: "block-like", next: "*" },
  { blankLine: "always", prev: "*", next: "block-like" },
];

const IMPORT_GROUPS = [
  "side-effect-style",
  "side-effect",
  ["type-builtin", "value-builtin"],
  ["type-external", "value-external"],
  ["type-internal", "value-internal"],
  ["type-parent", "type-sibling", "type-index", "value-parent", "value-sibling", "value-index"],
  "unknown",
];

const CLIPPED_NAMES = [
  "err",
  "evt",
  "cb",
  "el",
  "res",
  "req",
  "val",
  "tmp",
  "obj",
  "arr",
  "str",
  "num",
  "idx",
  "ctx",
  "cfg",
  "fn",
  "opts",
  "acc",
  "btn",
  "msg",
  "ov",
  "st",
  "elem",
  "attrs",
  "param",
];

const CODE_STYLE_RULES = {
  "func-style": ["error", "expression"],
  "prefer-arrow-functions/prefer-arrow-functions": ["error", { allowObjectProperties: true }],
  "prefer-arrow-callback": ["error", { allowNamedFunctions: false }],
  "no-restricted-exports": [
    "error",
    {
      restrictDefaultExports: {
        direct: true,
        named: true,
        defaultFrom: true,
        namedFrom: true,
        namespaceFrom: true,
      },
    },
  ],
  "no-restricted-syntax": ["error", ...BASE_SYNTAX],
  "no-else-return": ["error", { allowElseIf: false }],
  "no-lonely-if": "error",
  "no-nested-ternary": "error",
  "no-negated-condition": "error",
  "max-depth": ["error", { max: 2 }],
  complexity: ["error", { max: 10 }],
  "max-nested-callbacks": ["error", { max: 3 }],
  "max-params": "off",
  "@typescript-eslint/max-params": ["error", { max: 3 }],
  "max-lines": ["warn", { max: 250, skipBlankLines: true, skipComments: true }],
  "max-lines-per-function": ["warn", { max: 60, skipBlankLines: true, skipComments: true }],
  eqeqeq: ["error", "always"],
  "no-console": ["warn", { allow: ["warn", "error"] }],
  "no-implicit-coercion": "error",
  "object-shorthand": ["error", "always"],
  "prefer-template": "error",
  "no-warning-comments": ["warn", { terms: ["todo", "fixme", "hack", "xxx"], location: "start" }],
  "id-length": ["error", { min: 2, exceptions: ["_", "i", "x", "y"], properties: "never" }],
  "id-denylist": ["error", ...CLIPPED_NAMES],
  "@typescript-eslint/naming-convention": ["error", ...NAMING_WITHOUT_TYPES, BOOLEAN_NAMING],
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  "@typescript-eslint/consistent-type-imports": [
    "error",
    { prefer: "type-imports", fixStyle: "separate-type-imports" },
  ],
  "@typescript-eslint/consistent-type-exports": "error",
  "@typescript-eslint/no-unused-vars": [
    "error",
    { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
  ],
  "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
  "@typescript-eslint/no-confusing-void-expression": [
    "error",
    { ignoreArrowShorthand: true, ignoreVoidReturningFunctions: true },
  ],
  "@stylistic/multiline-comment-style": ["error", "starred-block"],
  "@stylistic/padding-line-between-statements": ["error", ...PADDING_LINES],
  "perfectionist/sort-imports": ["error", { groups: IMPORT_GROUPS }],
  "check-file/filename-naming-convention": fileNamingRule(MODULE_FILE_NAMES),
};

/**
 * Everything but the closing blocks: the recommended presets, type information and the
 * rules of the code standard. React and Next.js presets add their blocks after these.
 */
export const codeStyle = [
  {
    name: "@repo/eslint-config/ignores",
    ignores: [
      "**/.next/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/dist/**",
      "**/next-env.d.ts",
      ".claude/**",
      ".agents/**",
    ],
  },
  {
    name: "@repo/eslint-config/linter-options",
    linterOptions: {
      noInlineConfig: true,
      reportUnusedDisableDirectives: "error",
      reportUnusedInlineConfigs: "error",
    },
  },
  { ...js.configs.recommended, name: "@eslint/js/recommended" },
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    name: "@repo/eslint-config/type-information",
    languageOptions: { parserOptions: { projectService: true } },
  },
  {
    name: "@repo/eslint-config/code-style",
    plugins: {
      "@stylistic": stylistic,
      "check-file": checkFile,
      perfectionist,
      "prefer-arrow-functions": preferArrowFunctions,
    },
    rules: CODE_STYLE_RULES,
  },
  {
    name: "@repo/eslint-config/config-files",
    files: CONFIG_FILES,
    rules: { "no-restricted-exports": "off" },
  },
];

/**
 * The blocks every preset ends with. JavaScript files have no type information, so the
 * rules that need it are switched off for them. Prettier switches off the formatting
 * rules, `curly` included, which is why `curly` is set again after it.
 */
export const closing = [
  { ...tseslint.configs.disableTypeChecked, files: JAVASCRIPT_FILES },
  {
    name: "@repo/eslint-config/javascript",
    files: JAVASCRIPT_FILES,
    languageOptions: { globals: globals.node },
    rules: { "@typescript-eslint/naming-convention": ["error", ...NAMING_WITHOUT_TYPES] },
  },
  { ...prettier, name: "eslint-config-prettier" },
  {
    name: "@repo/eslint-config/curly",
    rules: { curly: ["error", "multi-line"] },
  },
];

export const base = [...codeStyle, ...closing];
