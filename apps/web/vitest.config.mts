import { react } from "@repo/vitest-config/react";
import { defineConfig, mergeConfig } from "vitest/config";

// The app ships without tests; the first one added runs with no change here.
export default mergeConfig(
  react,
  defineConfig({
    test: { passWithNoTests: true, setupFiles: ["./vitest.setup.ts"] },
  }),
);
