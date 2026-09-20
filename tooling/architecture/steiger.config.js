import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

import { fsdRoots } from "./fsd-roots.js";

// Steiger resolves a relative glob against the folder it found the config in, the root.
const inEveryRoot = (folder) => fsdRoots.map((root) => `./${root}/${folder}`);

const sharedRoots = fsdRoots.filter((root) => !root.startsWith("apps/"));

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // This rule compares the raw folder name, so it reads the prefix the guide asks for as a typo.
    files: [...inEveryRoot("_app/**"), ...inEveryRoot("_pages/**")],
    rules: {
      "fsd/typo-in-layer-name": "off",
    },
  },
  {
    // The rule reads "providers" as a name for what code is rather than for what it is for.
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
