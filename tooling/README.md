# 🧰 Tooling

> Shared configuration for the build and quality tools, one workspace package per tool.

## 🎯 Purpose

Every app and package in the monorepo is linted, formatted, type-checked, tested and spell-checked with the same rules. Those rules live here, once, as `@repo/*` packages that the workspaces install and extend.

## 🗂️ Structure

| Folder                                    | Package                    | Tool                                   | Used through                                                                                         |
| ----------------------------------------- | -------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| [`eslint/`](./eslint/README.md)           | `@repo/eslint-config`      | ESLint                                 | an `eslint.config.mjs` in each package                                                               |
| [`prettier/`](./prettier/README.md)       | `@repo/prettier-config`    | Prettier                               | the `prettier` key of the root `package.json`                                                        |
| [`typescript/`](./typescript/README.md)   | `@repo/typescript-config`  | TypeScript                             | `extends` in each `tsconfig.json`                                                                    |
| [`vitest/`](./vitest/README.md)           | `@repo/vitest-config`      | Vitest                                 | a `vitest.config.*` in each package with tests                                                       |
| [`spell-check/`](./spell-check/README.md) | `@repo/spell-check-config` | cspell                                 | the root `cspell.json`                                                                               |
| [`markdown/`](./markdown/README.md)       | `@repo/markdown-config`    | markdownlint                           | the root `.markdownlint-cli2.jsonc`                                                                  |
| [`tailwind/`](./tailwind/README.md)       | `@repo/tailwind-config`    | Tailwind CSS (theme and design tokens) | the global stylesheet and `postcss.config.mjs` of each app                                           |
| [`scripts/`](./scripts/README.md)         | `@repo/scripts`            | checks written for this repo           | root scripts, the git hooks in `lefthook.yml`, the CI workflows and the root `commitlint.config.mjs` |

## 🚀 Usage

Run every check from the repository root. Turbo runs it in each package that has the script, in parallel, and caches the result:

```bash
pnpm lint && pnpm lint:comments && pnpm format && pnpm types:check && pnpm test && pnpm spell:check && pnpm lint:md
```

A change in a `tooling/*` package invalidates the cached results that depend on it: through the workspace dependencies (a `transit` task) for ESLint, TypeScript and Vitest, and through the task inputs for Prettier and cspell, whose configs are declared once at the root.

> [!NOTE]
> Files that belong to no package (the root files, `docs/`, and loose files such as this README) are covered by root tasks, `lint:root`, `format:root` and `spell:check:root`, which run in the same Turbo run as the package tasks.

> [!IMPORTANT]
> Every tool skips `.claude/` and `.agents/`: they hold agent configuration and vendored agent skills, which ship their own example code.

## ⌨️ Commands

| Command                          | What it does                                                              |
| -------------------------------- | ------------------------------------------------------------------------- |
| `pnpm lint`                      | ESLint in every package and on the root files, and Steiger in the web app |
| `pnpm lint:fix`                  | ESLint with the fixes it can make on its own                              |
| `pnpm lint:arch`                 | Steiger only (Feature-Sliced Design structure)                            |
| `pnpm lint:comments [files...]`  | The comment check, over every tracked source file or over the files named |
| `pnpm lint:md`                   | markdownlint over every Markdown file                                     |
| `pnpm format`, `pnpm format:fix` | Prettier: check, or write                                                 |
| `pnpm types:check`               | `tsc --noEmit` (after `next typegen` in Next.js apps)                     |
| `pnpm test`                      | Vitest                                                                    |
| `pnpm spell:check`               | cspell over code and docs                                                 |

## 🧩 Extending

- **A new package** copies the scripts of a package of the same kind (`lint`, `format`, `spell:check`, and `types:check` or `test` when it has TypeScript or tests), adds the `@repo/*` packages it uses to `devDependencies` as `workspace:*`, and gets an `eslint.config.mjs`, a `tsconfig.json` or a `vitest.config.*` when it needs them. The Turbo tasks pick the scripts up with no change to `turbo.json`.
- **A version bump** goes in the `catalog` of `pnpm-workspace.yaml`. Exceptions to peer ranges, with their reasons, are in the same file.

## 🔗 Related

- [Contributing](../CONTRIBUTING.md): the checks to run before pushing.
- [Code conventions](../docs/conventions/README.md): the rules these tools enforce, with an Enforcement table per document.
