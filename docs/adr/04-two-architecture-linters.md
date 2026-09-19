---
tags: [adr, architecture, linting, monorepo]
aliases: [ADR 04, Steiger and dependency-cruiser]
status: accepted
---

# Two architecture linters, with no overlap between them

The structure of this repository is guarded by two linters that answer different questions, and by two checks that come with the toolchain.

- **Steiger** owns everything inside an FSD root: layer order, cross-imports between slices, public APIs, segment names. It is the official FSD linter, it understands slices, and it reads one root at a time.
- **dependency-cruiser** owns the graph between workspaces: which workspace may import which, cycles, and the public API of a root that a package shares between apps. It sees every file in the repository at once, which Steiger never does.
- **`turbo boundaries`** already reports an import that leaves a package without a dependency on it, and a cycle in the package graph. **sherif** already reports manifests that disagree.

The configuration follows one rule: **a violation is reported by exactly one of them.** Anything `turbo boundaries` or sherif covers is absent from dependency-cruiser, and dependency-cruiser declares no rule about layers, slices or public APIs inside a root.

## Considered options

**Only Steiger.** Rejected: it reads a single folder, so nothing would check that a package does not import an app, that `tooling` stays out of the product, or that two modules do not import each other.

**Only dependency-cruiser, with layer rules written by path.** Rejected: the FSD rules would then be regular expressions maintained by hand, next to an official linter that already implements them, understands slices and public APIs, and is updated with the methodology.

**Turborepo boundary tags for the direction rules.** Rejected: tags apply to packages that carry one, so a new package escapes every rule until somebody remembers to tag it. The path-based rules cover a workspace the day it is created.

**`no-orphans` and `not-to-unresolvable` from the dependency-cruiser presets.** Rejected: in a Next.js app every route file and every config file is an entry point that nothing imports, and the per-app path alias does not resolve outside its app, so both rules would report the framework instead of a mistake. TypeScript already fails on an import that does not resolve.

## Consequences

- `pnpm lint:arch` runs Steiger once per root, `pnpm lint:deps` runs dependency-cruiser over `apps`, `packages` and `tooling`, and `pnpm lint` runs both together with ESLint.
- Cycles belong to dependency-cruiser everywhere, including inside a root: Steiger has no rule for them.
- A cycle written with the `@/` alias is invisible to both, because dependency-cruiser does not resolve the alias. Between slices that cannot happen without a Steiger violation first; inside a slice, imports are relative and it is caught.
- Each rule has been watched to fail once, and the way to reproduce that is in [the architecture checks guide](../architecture/architecture-checks.md), which also says which check to read when something goes red.
