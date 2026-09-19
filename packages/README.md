# 📦 Packages

> Code the apps import, one workspace per subject, each consumed by name.

## 🎯 Purpose

A package is where code goes when **more than one app needs it**, or when it has a reason to change that has
nothing to do with any app. Until then the code belongs in the app that uses it: a package with one consumer
is an extra `package.json`, an extra config and an extra place to look.

Packages export TypeScript source rather than a build. Every consumer here is a bundler, and Node reads
TypeScript on its own, so there is no `dist/`, no build step to cache and no stale output to debug.

## 🗂️ Structure

| Package                   | Name        | Holds                                                                                  |
| ------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| [`ui/`](./ui/README.md)   | `@repo/ui`  | The shadcn/ui kit: the components, `cn`, and the stylesheet that registers them        |
| [`env/`](./env/README.md) | `@repo/env` | The environment: one zod schema per area, the loader, and the generated `.env.example` |

`tooling/` holds the other kind of workspace: configuration the tools read, rather than code an app imports.

## 🚀 Usage

A package is a dependency of the app that uses it, declared as `workspace:*`, and imported by name through
the entry points its `exports` allows:

```ts
import { Button } from "@repo/ui/components/button";
```

A deep import into a path the package does not export fails to compile, which is how the public API stays a
decision rather than an accident.

## ⌨️ Commands

| Command                              | What it does                                                  |
| ------------------------------------ | ------------------------------------------------------------- |
| `pnpm --filter @repo/ui lint`        | ESLint in one package                                         |
| `pnpm --filter @repo/ui types:check` | TypeScript in one package                                     |
| `pnpm --filter @repo/env test`       | Vitest in one package                                         |
| `pnpm lint:deps`                     | The import graph between workspaces                           |
| `pnpm lint:ws`                       | Versions and manifest fields that disagree between workspaces |

## 🧩 Extending

```bash
pnpm new
pnpm install
```

The generator asks where it goes, its name, one sentence of purpose, and whether it holds Feature-Sliced
Design layers, then writes the manifest, the four tooling configs, its own `cspell.json` and
`.prettierignore`, an entry point and a README. A package with layers is registered as an FSD root, so both
architecture linters cover it. Details in [`turbo/generators`](../turbo/generators/README.md).

- **Give it one subject.** "Utilities" is not a subject, and a package named after a layer of the stack
  rather than after what it does grows until nobody can say what it is for.
- **Export by segment, never by wildcard.** `"./shared/*"` pointing at `src/shared/*/index.ts` keeps the
  public API real; `"./*"` makes every file public and `pnpm lint:deps` reports the first deep import.
- **Versions come from the `catalog`** in [`pnpm-workspace.yaml`](../pnpm-workspace.yaml), so two packages
  cannot disagree about a dependency.

## 🔗 Related

- [`apps/`](../apps/README.md): who imports these
- [`tooling/`](../tooling/README.md): the other kind of workspace
- [`pnpm new`](../turbo/generators/README.md): what a generated package contains
- [ADR 03](../docs/adr/03-shared-code-in-workspace-packages.md): why shared code lives in packages, and when it may hold layers
