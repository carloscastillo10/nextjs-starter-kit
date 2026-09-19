# 🧩 src

> The application code of `web`, organized with Feature-Sliced Design: six layers, each importing only downwards.

## 🎯 Purpose

Everything the app does lives here. Next.js routing sits outside, in [`../app`](../app/README.md), and only
re-exports from this folder, which is what makes a screen a slice you can move rather than a file the
framework owns.

The rule the whole layout exists for: **a layer imports only from the layers below it, and never from another
slice on its own layer.** That is what keeps a change local, and `pnpm lint:arch` fails when it is broken.

## 🗂️ Structure

From highest to lowest:

| Layer    | Folder                            | Holds                                                                                  |
| -------- | --------------------------------- | -------------------------------------------------------------------------------------- |
| App      | [`_app/`](_app/README.md)         | Providers, global styles, fonts, root metadata, layouts, Route Handler implementations |
| Pages    | [`_pages/`](_pages/README.md)     | One slice per screen; its UI, data fetching and page logic                             |
| Widgets  | [`widgets/`](widgets/README.md)   | Discouraged; large UI blocks several pages share                                       |
| Features | [`features/`](features/README.md) | User actions reused by several pages                                                   |
| Entities | [`entities/`](entities/README.md) | Business domain models reused by several slices                                        |
| Shared   | [`shared/`](shared/README.md)     | Infrastructure with no business rules                                                  |

`_app` and `_pages` start with an underscore so they never collide with the Next.js `app/` and `pages/`
routing folders. This is the naming the Feature-Sliced Design guide for Next.js prescribes.

## 🚀 Usage

- **Import a slice through its public API**, its `index.ts`, never a file inside it.
- **Use the `@/` alias across slices and layers** — `@/_pages/home`, `@/shared/lib/format-date` — and relative
  paths inside a slice.
- **New code starts in the `_pages` slice that uses it.** Move it down to `features`, `entities` or `shared`
  only when it is used in more than one place now, changes for its own reasons, and has one focused job.
  Steiger fails a slice with a single consumer, which is the same rule stated by a tool.

```tsx
// app/settings/page.tsx
export { SettingsPage as default } from "@/_pages/settings";
```

## ⌨️ Commands

| Command                         | What it checks                                                              |
| ------------------------------- | --------------------------------------------------------------------------- |
| `pnpm lint:arch`                | Steiger: layer order, cross-imports, public APIs, segment names             |
| `pnpm lint:deps`                | dependency-cruiser: the graph between workspaces, and cycles                |
| `pnpm --filter web lint`        | ESLint, including the rule that route files import only `_pages` and `_app` |
| `pnpm --filter web types:check` | TypeScript, which is what catches an import the `exports` map forbids       |

## 🧩 Extending

A new layer is not something you add; the six are the model. What you add is a slice or a segment, and each
layer's README says when one is justified and how it is named. When two of them seem to fit, the placement
guide in [the architecture document](../../../docs/architecture/feature-sliced-design.md) decides.

## 🔗 Related

- [Feature-Sliced Design in `apps/web`](../../../docs/architecture/feature-sliced-design.md): the full guide, with placement tables and recipes
- [Architecture checks](../../../docs/architecture/architecture-checks.md): which tool owns which rule
- [`app/`](../app/README.md): the routing half
- [ADR 01](../../../docs/adr/01-feature-sliced-design-in-the-app-router.md) and [ADR 02](../../../docs/adr/02-one-path-alias-per-app.md): why this layout, and why one alias
