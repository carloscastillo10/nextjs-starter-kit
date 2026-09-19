---
tags: [architecture, linting, monorepo]
aliases: [Architecture checks, Which check owns which rule]
---

# Architecture checks

Four checks guard the shape of this repository, and each owns a different part of it. Knowing which one owns what is the difference between fixing a violation and arguing with a tool that was never going to see it.

The rule they are configured by: **one finding, one check.** When two tools could report the same violation, the rule is removed from the one that knows less about it.

## Which check owns what

| Check              | Command                | Owns                                                                                                                                  | Does not see                                            |
| ------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Steiger            | `pnpm lint:arch`       | Everything inside an FSD root: layer order, cross-imports between slices, public APIs, segment and slice names                        | Anything outside the roots it is given, and cycles      |
| dependency-cruiser | `pnpm lint:deps`       | The graph between workspaces: which workspace may import which, cycles, and the public API of a shared FSD package                    | Layers, slices, and imports written with the `@/` alias |
| `turbo boundaries` | `pnpm lint:boundaries` | A package importing a file outside its own folder, a package importing something it does not declare, and cycles in the package graph | Which layer an import crossed                           |
| sherif             | `pnpm lint:ws`         | The `package.json` files: versions that disagree, fields that are missing or out of order                                             | Imports                                                 |

Two more checks sit below them and work on one file at a time: ESLint (`pnpm lint`) for the rules in the [conventions](../conventions/README.md), and TypeScript (`pnpm types:check`) for an import that does not resolve. `pnpm lint` runs ESLint, Steiger and dependency-cruiser together; `pnpm gates` runs everything CI runs.

## Reading a failure

| What it says                                                                                          | Who said it        | What it means                                                                                              |
| ----------------------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| `fsd/forbidden-imports`, `fsd/no-public-api-sidestep`, `fsd/…`                                        | Steiger            | An import inside one FSD root broke the layer order, reached into a sibling slice or skipped an `index.ts` |
| `no-circular`                                                                                         | dependency-cruiser | Two modules import each other, directly or through a chain                                                 |
| `packages-do-not-import-apps`, `apps-do-not-import-each-other`, `tooling-does-not-import-the-product` | dependency-cruiser | An import pointed the wrong way between workspaces                                                         |
| `no-import-past-…-public-api`                                                                         | dependency-cruiser | A workspace reached into a shared FSD package instead of through the file its exports name                 |
| `Import outside of package boundary`, `not declared`                                                  | `turbo boundaries` | A package read a file it does not own, or imported a package it never declared                             |

## Why no finding is reported twice

- **Steiger owns the interior of every FSD root.** dependency-cruiser declares no rule about layers or slices, so a forbidden import inside `apps/web/src` is Steiger's alone. What it does look at there is cycles, which Steiger has no rule for.
- **Declaring a dependency is `turbo boundaries`' job.** dependency-cruiser therefore has no rule about undeclared imports. It has no `no-orphans` rule either: switched on here it reports six files, and every one of them is correct — a component of the UI kit no app imports yet, `next-env.d.ts`, the Vitest setup and the scripts only CI and a git hook call. A rule whose findings are all false is a rule people learn to scroll past.
- **`turbo boundaries` tags are deliberately unused.** They could express the direction rules, but only for packages that carry a tag, so a new package would silently escape them. The direction rules are written by path in dependency-cruiser instead, where a new workspace is covered the day it is created.
- A cycle between two workspaces that also declare each other in their manifests is the one violation both `turbo boundaries` and dependency-cruiser report, at different granularity: the first names the two packages, the second the two files that close the cycle.

Proving it stays true takes two commands. With a forbidden import inside a root, `pnpm lint:arch` fails and `pnpm lint:deps` passes; with a cycle between two files of one slice, the opposite.

## What no check sees

- **How a page slice is put together.** Steiger reads folders and imports; whether a screen's logic belongs in `ui/` or `model/`, and whether a slice earned its layer, is a review question. The route files are the one thing outside the roots that is checked anyway: ESLint restricts their imports to `@/_pages/*` and `@/_app/*`.
- **A cycle written with the `@/` alias.** dependency-cruiser resolves package and relative imports, not the alias of each app, so a cycle between two segments of `shared` or `_app` written as `@/shared/api` is invisible to it. Inside a slice, use relative imports, which it does resolve. Between slices the alias is required, and a cycle there is already a layer or cross-import violation that Steiger reports.
- **Whether a slice earns its layer.** `fsd/insignificant-slice` counts references, which is a proxy for the judgement in the [extraction rule](feature-sliced-design.md); the rule is off for roots that a package shares between apps, where the consumers live outside the root.

## Changing a rule

1. **Decide who owns it.** Inside a root, it is a Steiger rule. Across workspaces, dependency-cruiser. About manifests, sherif. If `turbo boundaries` already reports it, it is nobody else's.
2. Write it in [`tooling/architecture`](../../tooling/architecture/README.md), next to the rules it joins, with a `comment` that says what it protects rather than what it matches.
3. **Watch it fail once.** A guard nobody has seen fail is a guard nobody should trust:

   ```bash
   printf 'export { HomePage } from "../../../apps/web/src/_pages/home/index";\n' > packages/ui/src/violation.tmp.ts
   pnpm lint:deps   # error packages-do-not-import-apps: …
   rm packages/ui/src/violation.tmp.ts
   ```

4. Add the row it deserves to the tables above, in the same change.

## References

- [Feature-Sliced Design](feature-sliced-design.md): the layers Steiger checks, and the FSD roots both linters read
- [`@repo/architecture-config`](../../tooling/architecture/README.md): the list of roots and both rulesets
- [Two architecture linters](../adr/04-two-architecture-linters.md): why there are two, and what each one is for
- [dependency-cruiser rules reference](https://github.com/sverweij/dependency-cruiser/blob/main/doc/rules-reference.md) and [Turborepo boundaries](https://turborepo.dev/docs/reference/boundaries)
