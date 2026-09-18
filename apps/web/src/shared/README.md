# `shared`: shared layer

Infrastructure specific to this app, with no business rules. The layer has no slices; it is split into segments, each with its own public API.

## Segments

Create a segment when its first file arrives.

| Segment | Holds | Public API |
| --- | --- | --- |
| `ui/` | App-specific UI: branded compositions, shadcn blocks without page logic | one file or folder per component (`@/shared/ui/<name>`); a folder needs its own `index.ts` |
| `lib/` | Generic helpers: formatting, class names, small hooks | one file or folder per module (`@/shared/lib/<name>`), same as `ui/` |
| `api/` | API client, request functions several slices call, transport types (DTOs) | `api/index.ts` |
| `config/` | Environment variable access, route paths, app settings | `config/index.ts` |
| `auth/` | Session helpers and auth route constants | `auth/index.ts`, plus `auth/index.server.ts` for server-only exports |

## What does not go here

- Business rules. They belong to the slice that owns them.
- Imports from any other layer.
- Segments named after a kind of code: `components`, `hooks`, `utils`, `helpers`, `types`, `constants`. Steiger rejects them (`fsd/segments-by-purpose`). Name the segment after its purpose and put hooks in the segment they serve.
- An `assets/` segment. An image or icon lives next to the component that uses it.

## Relation to `packages/*`

Workspace packages (`@repo/*`, for example `@repo/ui` with the shadcn/ui primitives) sit outside the FSD layers and behave like third-party libraries: any layer may import them directly, and they never import from an app. They know nothing about this app. `shared/` holds the infrastructure that does: its routes, environment, API and branded UI. Move code from `shared/` into a package only when a second app needs it.

## Imports

- Segments may import each other.
- Libraries and `@repo/*` packages are fine.
- Nothing from `entities`, `features`, `widgets`, `_pages` or `_app`.

See [the architecture guide](../../../../docs/architecture/feature-sliced-design.md) for the full rules.
