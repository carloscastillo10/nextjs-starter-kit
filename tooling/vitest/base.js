import { configDefaults, defineConfig } from "vitest/config";

export const base = defineConfig({
  test: {
    environment: "node",
    passWithNoTests: true,
    include: ["**/*.test.{ts,tsx,mts,cts,js,mjs,cjs}"],
    exclude: [...configDefaults.exclude, "**/.next/**", "**/.claude/**", "**/.agents/**"],
  },
});
