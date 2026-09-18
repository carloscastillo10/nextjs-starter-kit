import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Next.js reserves the `app` and `pages` folder names, so the FSD guide for
    // Next.js renames those layers to `_app` and `_pages`. Steiger recognizes the
    // prefix, but this rule compares the raw folder name and reports both as typos.
    files: ["./src/_app/**", "./src/_pages/**"],
    rules: {
      "fsd/typo-in-layer-name": "off",
    },
  },
  {
    // The FSD guide for Next.js keeps the app-wide providers in a `providers`
    // segment. This rule lists "providers" among names that describe what code
    // is rather than what it is for, so it is exempted for that segment only.
    files: ["./src/_app/providers/**"],
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
]);
