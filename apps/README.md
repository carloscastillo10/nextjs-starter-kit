# 📱 Apps

> Deployable applications, one folder each. Everything else in this repository exists to serve them.

## 🎯 Purpose

An app is the only thing here that is deployed and the only thing that owns routing. It imports from
[`packages/`](../packages/README.md), it is configured by [`tooling/`](../tooling/README.md), and it exports
nothing: **no app ever imports another app.** `pnpm lint:deps` fails when one tries.

The template ships one, and the folder is plural because adding a second is a normal thing to do — a
marketing site beside the product, an admin panel, a docs site.

## 🗂️ Structure

| Path                      | What it is                                                                   |
| ------------------------- | ---------------------------------------------------------------------------- |
| [`web/`](./web/README.md) | The Next.js application: routing in `app/`, the code in `src/` as FSD layers |

An app is named without a scope — the package is `web`, not `@repo/web` — because nothing imports it. The
`@repo/*` scope belongs to `packages/` and `tooling/`, which are imported by name.

## 🚀 Usage

From the repository root, with `--filter <app>` to narrow any task to one app:

```bash
pnpm dev --filter web
pnpm build --filter web
```

## ⌨️ Commands

| Command                   | What it does                                     |
| ------------------------- | ------------------------------------------------ |
| `pnpm dev`                | Every app in watch mode                          |
| `pnpm build`              | Builds every app through the dependency graph    |
| `pnpm --filter web start` | Serves the production build of one app           |
| `pnpm gates`              | Every check CI runs, across the whole repository |

## 🧩 Extending

`pnpm new` does not generate an app: an app comes from its framework's own scaffold, and for Next.js that is
`create-next-app`. From `apps/`:

```bash
pnpm create next-app@latest <name> --ts --app --no-src-dir --no-tailwind --no-eslint --import-alias "@/*"
```

Then, before it works here:

1. **Delete what it wrote for a standalone repository**: `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `.git/`,
   `.gitignore` and `node_modules/`. This repository declares its workspaces, its lockfile and its ignores
   once, at the root, and a nested `pnpm-workspace.yaml` makes pnpm treat the app as its own workspace.
2. **Rewrite its README** from the [house template](../docs/conventions/documentation.md).
3. **Match the manifest**: the name without a scope, `private: true`, the same `engines` as the other
   workspaces, and `catalog:` instead of a version for every shared dependency.
4. **Add the shared configs** the way `apps/web` does: `eslint.config.mjs`, `tsconfig.json` extending
   `@repo/typescript-config/nextjs.json`, `prettier.config.mjs`, `vitest.config.mts`, its own `cspell.json`
   and `.prettierignore`.
5. **Register its Feature-Sliced Design root** in
   [`tooling/architecture/fsd-roots.json`](../tooling/architecture/README.md), so Steiger lints it.
6. **Keep the `AGENTS.md` and `CLAUDE.md` that `next dev` writes.** Next.js rewrites them on every run;
   removing them from a diff only recreates the change.
7. From the repository root, `pnpm install`, then `pnpm gates`.

## 🔗 Related

- [apps/web](./web/README.md): the app that ships, and the shape a second one copies
- [Feature-Sliced Design](../docs/architecture/feature-sliced-design.md): the layers inside an app
- [Packages](../packages/README.md): what an app is allowed to import
- [Contributing](../CONTRIBUTING.md): the checks a new workspace has to pass
