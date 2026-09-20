import { react } from "@repo/vitest-config/react";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  react,
  defineConfig({
    test: { passWithNoTests: true, setupFiles: ["./vitest.setup.ts"] },
  }),
);
