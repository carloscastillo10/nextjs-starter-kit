import { base } from "@repo/vitest-config";
import { defineConfig, mergeConfig } from "vitest/config";

// The kit ships without tests of its own; the first one added runs with no change here.
export default mergeConfig(base, defineConfig({ test: { passWithNoTests: true } }));
