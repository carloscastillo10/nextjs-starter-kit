# 🧪 @repo/vitest-config

> Vitest configs for Node packages and React code.

## 🎯 Purpose

Tests run the same way in every package: explicit imports from `vitest` (no globals), tests next to the code they test, named `*.test.*`.

## 🗂️ Structure

| File                     | Export  | For                                                                              |
| ------------------------ | ------- | -------------------------------------------------------------------------------- |
| `base.js`, `base.d.ts`   | `base`  | Node code: the `node` environment, the test file pattern, and passing with none  |
| `react.js`, `react.d.ts` | `react` | React code: `base` plus `jsdom` and the `paths` of the package's `tsconfig.json` |

Vite 8 compiles TSX on its own and resolves `tsconfig` paths natively, so neither `@vitejs/plugin-react` nor `vite-tsconfig-paths` is needed.

## 🚀 Usage

```ts
// vitest.config.mts of a Next.js app
import { react } from "@repo/vitest-config/react";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
  react,
  defineConfig({
    test: { setupFiles: ["./vitest.setup.ts"] },
  }),
);
```

```ts
// vitest.setup.ts
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
```

The package installs `vitest`, `vite`, `@repo/vitest-config` and, for React, `jsdom`, `@testing-library/react` and `@testing-library/dom`, and adds a `test` script (`vitest run`).

> [!TIP]
> Name the config `vitest.config.mts` in a package without `"type": "module"`, such as a Next.js app: Vite loads the config natively, and the `.mts` extension marks it as ES module.

> [!WARNING]
> Vitest does not render `async` Server Components. Test their logic as plain functions, and the rendered page end to end.

## ⌨️ Commands

| Command                         | What it does                   |
| ------------------------------- | ------------------------------ |
| `pnpm test`                     | Run every package's tests once |
| `pnpm --filter web exec vitest` | Watch mode in one package      |

## 🧩 Extending

- Coverage: install `@vitest/coverage-v8` in the package and pass `--coverage`; add `coverage/**` to the task's `outputs` in `turbo.json` if it should be cached.
- Browser-only matchers such as `toBeInTheDocument` come from `@testing-library/jest-dom`, imported in the setup file.

## 🔗 Related

- [React conventions](../../docs/conventions/react.md): where hooks and components live, and so where their tests go
