import { defineConfig, mergeConfig } from "vitest/config";

import { base } from "./base.js";

export const react = mergeConfig(
  base,
  defineConfig({
    resolve: { tsconfigPaths: true },
    test: { environment: "jsdom" },
  }),
);
