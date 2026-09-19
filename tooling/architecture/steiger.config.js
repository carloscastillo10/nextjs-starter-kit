import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

import { fsdRoots } from "./fsd-roots.js";

/*
 * Steiger resolves a relative glob against the folder holding the configuration file
 * it found, which is the repository root.
 */
const inEveryRoot = (folder) => fsdRoots.map((root) => `./${root}/${folder}`);

/*
 * Steiger counts the references a slice has inside the root it reads. A root that a
 * package shares between apps is consumed from outside that root, so every slice in
 * it looks unused. The package exports say what is public there instead.
 */
const sharedRoots = fsdRoots.filter((root) => !root.startsWith("apps/"));

export default defineConfig([
  ...fsd.configs.recommended,
  {
    /*
     * Next.js reserves the `app` and `pages` folder names, so the FSD guide for
     * Next.js renames those layers to `_app` and `_pages`. Steiger recognizes the
     * prefix, but this rule compares the raw folder name and reports both as typos.
     */
    files: [...inEveryRoot("_app/**"), ...inEveryRoot("_pages/**")],
    rules: {
      "fsd/typo-in-layer-name": "off",
    },
  },
  {
    /*
     * The FSD guide for Next.js keeps the app-wide providers in a `providers`
     * segment. This rule lists "providers" among names that describe what code
     * is rather than what it is for, so it is exempted for that segment only.
     */
    files: inEveryRoot("_app/providers/**"),
    rules: {
      "fsd/segments-by-purpose": "off",
    },
  },
  ...(sharedRoots.length > 0
    ? [
        {
          files: sharedRoots.map((root) => `./${root}/**`),
          rules: {
            "fsd/insignificant-slice": "off",
          },
        },
      ]
    : []),
]);
