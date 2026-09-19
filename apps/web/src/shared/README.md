# 🔧 shared

> The shared layer: infrastructure this app needs, with no business rules in it.

## 🎯 Purpose

The bottom layer, which everything else may import and which imports nothing from above. It holds the parts
that are specific to this app but say nothing about the domain: its API client, its route paths, its generic
helpers, its own UI compositions.

The layer has **no slices**. It is split into segments, each with its own public API, and a segment is
created when its first file arrives.

## 🗂️ Structure

| Segment   | Holds                                                                | Public API                                                                                 |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ui/`     | App-specific UI: branded compositions, CLI blocks without page logic | One file or folder per component (`@/shared/ui/<name>`); a folder needs its own `index.ts` |
| `lib/`    | Generic helpers: formatting, class names, small hooks                | One file or folder per module (`@/shared/lib/<name>`), the same way                        |
| `api/`    | The API client, requests several slices call, and transport types    | `api/index.ts`                                                                             |
| `config/` | Environment variable access, route paths, app settings               | `config/index.ts`                                                                          |

A segment is named after **its purpose**, and an integration adds its own: the session helpers and route
constants of an authentication provider go in `auth/`, exposing `index.ts` plus an `index.server.ts` beside
it for anything that calls a server-only API.

## 🚀 Usage

```ts
import { formatDate } from "@/shared/lib/format-date";
```

Imports:

- Segments may import each other.
- Libraries and `@repo/*` packages are fine.
- **Nothing from `entities`, `features`, `widgets`, `_pages` or `_app`.**

### How this differs from a package

Workspace packages such as [`@repo/ui`](../../../../packages/ui/README.md) sit outside the layers and behave
like third-party libraries: any layer may import them directly, and they never import from an app. **They
know nothing about this app.** `shared/` holds the infrastructure that does — its routes, its environment,
its API, its branded UI. Move code from here into a package when a second app needs it, and not before.

## 🧩 Extending

What does not belong here:

- **Business rules.** They belong to the slice that owns them.
- **Segments named after a kind of code**: `components`, `hooks`, `utils`, `helpers`, `types`, `constants`.
  Steiger rejects them (`fsd/segments-by-purpose`). Name the segment after its purpose, and put a hook in the
  segment it serves.
- **An `assets/` segment.** An image or an icon lives next to the component that uses it.

> [!NOTE]
> The shadcn CLI writes its blocks in kebab-case, and `check-file` asks for PascalCase elsewhere in
> `src/**/*.tsx`. `src/shared/ui/**` keeps kebab-case for that reason: renaming a generated file costs the
> next `add --diff` its match. A block that carries logic for one screen belongs in that screen's `_pages`
> slice anyway.

## 🔗 Related

- [`src/`](../README.md): the six layers and the import rule between them
- [`@repo/ui`](../../../../packages/ui/README.md): the kit every app shares, outside the layers
- [Feature-Sliced Design in `apps/web`](../../../../docs/architecture/feature-sliced-design.md): the full rules
- [ADR 03](../../../../docs/adr/03-shared-code-in-workspace-packages.md): when shared code becomes a package
