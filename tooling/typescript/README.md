# 🟦 @repo/typescript-config

> Strict TypeScript compiler options shared by every package.

## 🎯 Purpose

Every package type-checks with the same strict settings, so a type that compiles in one place compiles everywhere.

## 🗂️ Structure

| File          | For                                                                                                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------- |
| `base.json`   | Any package: ES2023, bundler resolution, `noEmit`, and the strict flags below                                       |
| `nextjs.json` | Next.js apps: `base.json` plus the DOM libraries, `react-jsx`, `allowJs`, incremental checks and the Next.js plugin |

Beyond `strict`, `base.json` turns on:

| Flag                         | Catches                                                      |
| ---------------------------- | ------------------------------------------------------------ |
| `noUncheckedIndexedAccess`   | Reading an array item or record entry as if it always exists |
| `noImplicitOverride`         | A method that overrides another without saying so            |
| `noImplicitReturns`          | A code path that forgets to return                           |
| `noFallthroughCasesInSwitch` | A `case` that falls into the next one                        |

Unused variables are ESLint's job (it allows a leading `_`), and type-only imports are enforced by `consistent-type-imports`, so `noUnused*` and `verbatimModuleSyntax` stay off. `exactOptionalPropertyTypes` stays off too: third-party component types rarely support it.

## 🚀 Usage

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", "**/*.mts", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`include`, `exclude` and `paths` resolve against the file that declares them, so they stay in each package.

> [!NOTE]
> TypeScript 6 no longer loads every `@types/*` package by default. A package that uses Node.js globals without importing anything that references them adds `"types": ["node"]`.

## ⌨️ Commands

| Command            | What it does                                                          |
| ------------------ | --------------------------------------------------------------------- |
| `pnpm types:check` | `tsc --noEmit` in every package, after `next typegen` in Next.js apps |

## 🧩 Extending

- A library that emits JavaScript adds `outDir`, `rootDir` and `declaration`, and switches `noEmit` off, in its own `tsconfig.json`.
- TypeScript stays on 6.0.x: `typescript-eslint` supports TypeScript below 6.1, and TypeScript 7 ships without the compiler API the type-aware lint rules use.

## 🔗 Related

- [@repo/eslint-config](../eslint/README.md): the type-aware rules that read these settings
