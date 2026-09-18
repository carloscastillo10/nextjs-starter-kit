# `src/`: application code (Feature-Sliced Design)

This folder holds the application code of `web`, organized with [Feature-Sliced Design](https://fsd.how) (FSD) v2.1. Next.js routing lives outside it, in [`../app`](../app/README.md), and only re-exports from here.

## Layers

From highest to lowest. A layer may import only from the layers below it.

| Layer    | Folder                            | Purpose                                                                          |
| -------- | --------------------------------- | -------------------------------------------------------------------------------- |
| App      | [`_app/`](_app/README.md)         | Providers, global styles, fonts, app-wide layouts, Route Handler implementations |
| Pages    | [`_pages/`](_pages/README.md)     | One slice per screen; owns its UI, data fetching and page logic                  |
| Widgets  | [`widgets/`](widgets/README.md)   | Discouraged; large UI blocks shared by several pages                             |
| Features | [`features/`](features/README.md) | User actions reused by several pages                                             |
| Entities | [`entities/`](entities/README.md) | Business domain models reused by several slices                                  |
| Shared   | [`shared/`](shared/README.md)     | Infrastructure with no business logic                                            |

`_app` and `_pages` start with an underscore so they never collide with the Next.js `app/` and `pages/` routing folders. This is the naming the FSD guide for Next.js prescribes.

## Rules in short

- Import only from lower layers, never from another slice on the same layer.
- Import a slice through its public API (`index.ts`), never a file inside it.
- Use the `@/` alias across slices and layers (`@/_pages/home`, `@/shared/ui/button`); use relative paths inside a slice.
- Put new code in the `_pages` slice that uses it. Move it down to `features`, `entities` or `shared` only when it is reused now, changes for its own reasons, and has one focused job.
- Check the structure with `pnpm --filter web lint:arch` (Steiger).

The full guide, with placement tables and step-by-step recipes, is [docs/architecture/feature-sliced-design.md](../../../docs/architecture/feature-sliced-design.md).
