---
tags: [adr, architecture, typescript, nextjs]
aliases: [ADR 02, One path alias]
status: accepted
---

# One path alias per app, pointing at the FSD root

`apps/web/tsconfig.json` declares a single alias, `@/*` → `./src/*`, and no other. Every import from outside the current slice therefore names the layer it comes from: `@/_pages/home`, `@/features/like-post`, `@/shared/api`.

Two properties come from that. **Nothing can import a route file**, because `apps/web/app/` is not reachable through an alias, which is what keeps the routing folder a leaf of the graph rather than a layer. And **the layer is visible at the import site**, so a forbidden import looks wrong while it is being written, not only when the linter runs.

## Considered options

**An alias per layer** (`@pages/*`, `@shared/*`). Rejected: five aliases to maintain in `tsconfig.json`, and the layer name is already the first segment of the path.

**An alias to the app root** (`~/*` → `./*`). Rejected: it makes the route files importable from inside `src`, which inverts the direction the whole layout exists to enforce.

## Consequences

- Inside a slice, imports are relative (`./ui/HomePage`); across slices they use the alias. Steiger's `fsd/import-locality` rule, which would check that, stays off: inside `shared` it would reject the alias imports the shadcn CLI writes.
- dependency-cruiser resolves package and relative imports, not this alias, which is one reason the interior of an FSD root is Steiger's ground and not its own.
- A second app declares the same alias for its own `src`. The two never see each other: an app reaches another app's code only through a package, and `pnpm lint:deps` fails when it does not.
