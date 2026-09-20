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
     * Reordering a primitive costs the next `add --diff` its match, and the only thing the
     * rule finds here is the variant object `cva` reads, whose keys carry no order.
     */
    name: "ui/generated-components",
    files: ["src/components/**/*.tsx"],
    rules: {
      "perfectionist/sort-object-types": "off",
      "perfectionist/sort-objects": "off",
    },
  },
]);
