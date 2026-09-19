# 🌐 web

> The Next.js application: the page Next.js ships, fully wired, with the layers a feature goes into in place.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [Adding a page](#adding-a-page)
  - [Adding a component](#adding-a-component)
  - [Adding an environment variable](#adding-an-environment-variable)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

One Next.js App Router application, on React Server Components by default. It renders the landing page
`create-next-app` ships and nothing else, on purpose: what the template provides is the shape around it — the
routing convention, the six Feature-Sliced Design layers with a README each, the theme, the UI kit, and the
checks that keep all of it honest.

**Routing and application code are separate folders.** `app/` holds nothing but thin route files that
re-export from `src/`, which is what keeps a page a slice you can move rather than a file the framework owns.

## 🗂️ Structure

| Path                                   | Holds                                                                                              |
| -------------------------------------- | -------------------------------------------------------------------------------------------------- |
| [`app/`](./app/README.md)              | Next.js routing: `layout.tsx`, `page.tsx`, and route files that only re-export                     |
| [`src/`](./src/README.md)              | The application code, as Feature-Sliced Design layers, reached through the `@/` alias              |
| `public/`                              | Static files served at a fixed URL: the two logos the home page renders                            |
| `components.json`                      | shadcn CLI configuration: it writes components into `@repo/ui` and variables into the shared theme |
| `next.config.ts`                       | Loads and validates the environment before Next.js reads it, and compiles `@repo/ui` with the app  |
| `postcss.config.mjs`                   | Re-exports the PostCSS config of `@repo/tailwind-config`                                           |
| `prettier.config.mjs`                  | The shared Prettier config, plus the stylesheet its Tailwind plugin sorts classes against          |
| `eslint.config.mjs`                    | The shared flat config, plus the paths `better-tailwindcss` needs                                  |
| `tsconfig.json`                        | Extends `@repo/typescript-config/nextjs.json`; declares the one alias, `@/*` → `./src/*`           |
| `vitest.config.mts`, `vitest.setup.ts` | Vitest with a jsdom environment, ready for the first test                                          |
| `AGENTS.md`, `CLAUDE.md`               | Written and rewritten by `next dev`. Committed as they are, and excluded from the formatters       |

Files that Next.js only finds beside `app/` — `proxy.ts`, `instrumentation.ts` — go in this folder, not in
`src/`.

## 🚀 Usage

```bash
pnpm dev --filter web     # http://localhost:3000
```

No configuration is needed to start. `NEXT_PUBLIC_SITE_URL` defaults to `http://localhost:3000` and is what
relative Open Graph and canonical URLs resolve against, so it is the one variable to set before deploying.

### Adding a page

1. Write the slice in `src/_pages/<name>/`: `ui/<Name>Page.tsx`, plus an `index.ts` that exports it.
2. Add the route file, which re-exports it and nothing more:

   ```tsx
   export { SettingsPage as default } from "@/_pages/settings";
   ```

3. Route segment config — `dynamic`, `revalidate`, `runtime` — is written as a literal in the route file.
   Next.js parses it statically, and re-exporting it fails the build. `metadata`, `generateMetadata` and
   `generateStaticParams` may be re-exported.

### Adding a component

A primitive that any app could use comes from the kit. The CLI is run **from this folder**, and writes the
component into [`@repo/ui`](../../packages/ui/README.md) and its variables into the shared theme:

```bash
cd apps/web && pnpm dlx shadcn@latest add dialog
```

A component that only this app has goes in the slice that renders it, under its `ui/` segment. ESLint reports
a raw `button`, `input`, `select`, `textarea`, `label` or `dialog` element in `src/`, because the kit is the
first answer.

### Adding an environment variable

The schema is the source of truth, and two checks make sure nothing drifts from it:

```bash
# add the variable to a schema in packages/env/src/schemas/, then
pnpm env:emit            # rewrites .env.example
pnpm env:check:turbo     # fails until turbo.json declares it too
```

## ⌨️ Commands

Every command runs from the repository root. `--filter web` narrows a repository-wide task to this app.

| Command                         | What it does                                                      |
| ------------------------------- | ----------------------------------------------------------------- |
| `pnpm dev --filter web`         | The dev server, with Turbopack                                    |
| `pnpm build --filter web`       | The production build                                              |
| `pnpm --filter web start`       | Serves the production build                                       |
| `pnpm --filter web types:check` | `next typegen`, then `tsc --noEmit`                               |
| `pnpm --filter web lint`        | ESLint, including the Tailwind and Feature-Sliced Design rules    |
| `pnpm --filter web test`        | Vitest                                                            |
| `pnpm lint:arch`                | Steiger, over the layers in `src/`                                |
| `pnpm --filter web clean`       | Removes `.next`, `.turbo`, `node_modules` and the generated types |

## 🧩 Extending

- **Where a file goes** is answered by the placement guide in
  [`docs/architecture/feature-sliced-design.md`](../../docs/architecture/feature-sliced-design.md), and each
  layer's README repeats the rule for that layer. New code starts in the `_pages` slice that uses it and
  moves down only once something else needs it.
- **A new folder whose Tailwind classes should be built** has to appear in an `@source` line of
  `src/_app/styles/globals.css`. Tailwind runs with `source(none)`, so nothing is scanned implicitly and a
  missing line shows up as utilities that silently do not exist.
- **Authentication is not here.** The architecture guide says where a provider goes: the provider component
  in `src/_app/providers/`, its screens as `_pages` slices, its session checks in the resource rather than in
  a proxy. [ADR 09](../../docs/adr/09-no-authentication-in-the-template.md) is why the template ships none.
- **A second app** is scaffolded rather than generated; [`apps/README.md`](../README.md) has the checklist.

## 🔗 Related

- [app](./app/README.md) and [src](./src/README.md): the two halves, with a README per layer
- [Feature-Sliced Design](../../docs/architecture/feature-sliced-design.md): the full guide and placement tables
- [@repo/ui](../../packages/ui/README.md) and [@repo/tailwind-config](../../tooling/tailwind/README.md): the kit and the tokens
- [@repo/env](../../packages/env/README.md): how a variable is declared, validated and reaches the build
- [DESIGN.md](../../DESIGN.md): the design system this app renders
