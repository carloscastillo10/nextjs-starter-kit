import { react } from "@repo/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  react,
  {
    name: "ui/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
  {
    /*
     * A primitive here is the shadcn CLI's output, taken with `add --diff` and merged by
     * hand, so every reordering costs that merge. The order the rule asks for is about a
     * component's props, and the only thing it finds here is the variant object `cva`
     * reads, where the keys carry no order: the props these components destructure
     * already read `className` first.
     */
    name: "ui/generated-components",
    files: ["src/components/**/*.tsx"],
    rules: {
      "perfectionist/sort-object-types": "off",
      "perfectionist/sort-objects": "off",
    },
  },
]);
