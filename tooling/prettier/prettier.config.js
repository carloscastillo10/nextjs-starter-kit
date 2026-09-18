/*
 * The plugin is imported rather than named: Prettier resolves a plugin name from the
 * directory it runs in, and the packages using this config do not depend on the plugin.
 */
import * as tailwindcss from "prettier-plugin-tailwindcss";

export default {
  printWidth: 100,
  semi: true,
  singleQuote: false,
  trailingComma: "all",
  arrowParens: "always",
  endOfLine: "lf",
  plugins: [tailwindcss],
  tailwindFunctions: ["cn", "cva"],
  overrides: [
    {
      /*
       * Code blocks in documentation are laid out by hand: some show code the way it
       * should not be written, and reformatting them would change the example.
       */
      files: "*.md",
      options: { proseWrap: "preserve", embeddedLanguageFormatting: "off" },
    },
    {
      /*
       * JSON with comments is read by stricter parsers than JavaScript's (editors, the
       * TypeScript config loader), and some of them reject a trailing comma.
       */
      files: ["*.jsonc", "tsconfig.json", "tsconfig.*.json"],
      options: { trailingComma: "none" },
    },
  ],
};
