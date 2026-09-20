// Imported, not named: Prettier resolves a plugin name from the directory it runs in.
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
      // Some code blocks show code the way it should not be written; formatting changes them.
      files: "*.md",
      options: { proseWrap: "preserve", embeddedLanguageFormatting: "off" },
    },
    {
      // Some of the stricter parsers that read these files reject a trailing comma.
      files: ["*.jsonc", "tsconfig.json", "tsconfig.*.json"],
      options: { trailingComma: "none" },
    },
  ],
};
