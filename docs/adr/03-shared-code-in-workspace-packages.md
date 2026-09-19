---
tags: [adr, architecture, monorepo, feature-sliced-design]
aliases: [ADR 03, Shared code in packages, "@repo/* packages"]
status: accepted
---

# Shared code lives in `@repo/*` packages, and may hold FSD layers of its own

Code that more than one app needs moves to a workspace package under `packages/`, named `@repo/<name>`. To an app, such a package behaves like any third-party library: every layer, `shared` included, may import it through the package exports, and the package itself knows no app.

A package may hold FSD layers of its own. That is how two apps share a domain without either of them owning it, and it is what the [official FSD guidance for monorepos](https://feature-sliced.design/blog/frontend-monorepo-explained) describes: the monorepo shares packages, FSD structures what is inside each one. The layers worth sharing are `shared`, `entities` and `features`; `_app` and `_pages` are the initialization and the screens of one app and stay there.

Because a package with layers is a second FSD root, the roots are declared in one file, `tooling/architecture/fsd-roots.json`, which both architecture linters read. Steiger lints every root; dependency-cruiser takes the same list to know which folders are interiors it must not rule on, and which public APIs it has to protect from the outside.

## Considered options

**One list per tool.** Rejected: two lists disagree the first time somebody adds a root, and the disagreement is silent — one tool stops checking, the other starts reporting nonsense.

**A convention instead of a list** ("any `src` folder with a `shared` subfolder is a root"). Rejected: guessing is cheap until it is wrong, and a wrong guess makes a linter skip a folder without saying so.

**Letting apps import each other for shared screens.** Rejected: two apps that import each other are one deployment with two entry points.

## Consequences

- The package `exports` field is the public API: one entry per slice or segment, pointing at that folder's `index.ts`. A wildcard export turns the package inside out, and `pnpm lint:deps` fails on the first import that reaches past an index.
- `fsd/insignificant-slice` is off for roots outside `apps/`. It counts references inside the root it reads, and the consumers of a shared package are by definition outside it.
- Code moves to a package when a second app consumes it, not in anticipation. A package with one consumer is a boundary that costs more than it returns.
- Adding a root is one line in the list. The package generator (`pnpm new`) writes that line when the package it creates has layers.
