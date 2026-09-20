import eslintReact from "@eslint-react/eslint-plugin";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";

import { closing, codeStyle, fileNamingRule, MODULE_FILE_NAMES } from "./base.js";
import { BASE_SYNTAX, COMPONENT_SYNTAX } from "./syntax.js";

const REACT_FILES = ["**/*.{ts,tsx}"];

const COMPONENT_FILES = ["**/*.tsx"];

// Copies of rules the React team's plugin also carries, so each problem is reported once.
const RULES_OWNED_BY_REACT_HOOKS = [
  "rules-of-hooks",
  "exhaustive-deps",
  "static-components",
  "purity",
  "refs",
  "set-state-in-effect",
  "set-state-in-render",
  "immutability",
  "globals",
  "use-memo",
  "error-boundaries",
  "unsupported-syntax",
];

const JSX_PROP_ORDER = {
  type: "unsorted",
  groups: ["key", "class-name", "unknown", "callback"],
  customGroups: [
    { groupName: "key", elementNamePattern: "^key$" },
    { groupName: "class-name", elementNamePattern: "^className$" },
    { groupName: "callback", elementNamePattern: "^on[A-Z]" },
  ],
};

const FIELD_GROUPS = {
  groups: ["class-name", "unknown", "callback"],
  customGroups: [
    { groupName: "class-name", elementNamePattern: "^className$" },
    { groupName: "callback", elementNamePattern: "^(on|handle)[A-Z]" },
  ],
};

const FIELD_ORDER = { type: "alphabetical", ...FIELD_GROUPS };

const WRITTEN_ORDER = { type: "unsorted", ...FIELD_GROUPS };

const HOOK_FILES = ["**/model/use-*.ts", "**/api/use-*.ts"];

export const reactBlocks = [
  {
    ...reactHooks.configs.flat["recommended-latest"],
    name: "react-hooks/recommended-latest",
    files: REACT_FILES,
  },
  { ...eslintReact.configs["recommended-type-checked"], files: REACT_FILES },
  {
    name: "@repo/eslint-config/react/rules-owned-by-react-hooks",
    files: REACT_FILES,
    rules: Object.fromEntries(
      RULES_OWNED_BY_REACT_HOOKS.map((rule) => [`@eslint-react/${rule}`, "off"]),
    ),
  },
  { ...jsxA11y.flatConfigs.recommended, files: COMPONENT_FILES },
  {
    name: "@repo/eslint-config/react/rules",
    files: REACT_FILES,
    rules: {
      "react-hooks/exhaustive-deps": "warn",
      "@eslint-react/no-array-index-key": "error",
      "@eslint-react/no-forward-ref": "error",
      "@eslint-react/no-use-context": "error",
      "@eslint-react/no-context-provider": "error",
      "@eslint-react/no-unstable-context-value": "error",
      "@eslint-react/no-unstable-default-props": "error",
      "@eslint-react/use-state": "error",
      "@eslint-react/jsx-no-useless-fragment": "error",
      "@eslint-react/dom-no-missing-button-type": "error",
      "@eslint-react/dom-no-unsafe-target-blank": "error",
    },
  },
  {
    name: "@repo/eslint-config/react/components",
    files: COMPONENT_FILES,
    rules: {
      "no-restricted-syntax": ["error", ...BASE_SYNTAX, ...COMPONENT_SYNTAX],
      "perfectionist/sort-jsx-props": ["error", JSX_PROP_ORDER],
    },
  },
  {
    name: "@repo/eslint-config/react/prop-order",
    files: COMPONENT_FILES,
    rules: {
      "perfectionist/sort-object-types": ["error", FIELD_ORDER],
      // perfectionist takes the first `useConfigurationIf` that matches, so the last one is the fallback.
      "perfectionist/sort-objects": [
        "error",
        { useConfigurationIf: { objectType: "destructured" }, ...FIELD_ORDER },
        WRITTEN_ORDER,
      ],
    },
  },
  {
    name: "@repo/eslint-config/react/hook-field-order",
    files: HOOK_FILES,
    rules: {
      "perfectionist/sort-object-types": ["error", FIELD_ORDER],
      "perfectionist/sort-objects": ["error", FIELD_ORDER],
    },
  },
];

export const react = [
  ...codeStyle,
  ...reactBlocks,
  {
    name: "@repo/eslint-config/react/file-names",
    rules: {
      "check-file/filename-naming-convention": fileNamingRule({
        ...MODULE_FILE_NAMES,
        "**/*.tsx": "KEBAB_CASE",
      }),
    },
  },
  ...closing,
];
