---
tags: [adr, architecture, feature-sliced-design, nextjs]
aliases: [ADR 01, FSD in the App Router]
status: accepted
---

# Feature-Sliced Design under the Next.js App Router

The web app organizes its code with [Feature-Sliced Design](https://fsd.how) v2.1: layers in `apps/web/src`, one slice per screen, imports that only ever point down. Next.js reserves the folder names `app` and `pages` for routing, which collide with two FSD layer names, so this repository follows the layout the FSD guide for Next.js prescribes: the layers live in `src/` with the two colliding ones renamed `_app` and `_pages`, and `apps/web/app/` holds route files that do nothing but re-export a page slice.

The alternative shapes were tried and rejected before this one was written down.

## Considered options

**Routing inside `src/app`, with the layers beside it.** Rejected: Next.js would then own a folder that FSD also claims, every route file would sit next to slice code, and the layer named `app` would have to be called something else anyway.

**Keeping the old Pages Router convention of an empty `pages/` folder.** Rejected: it exists to stop Next.js from confusing the two routers, and this app has no Pages Router.

**No methodology, just folders by kind (`components`, `hooks`, `utils`).** Rejected: that layout has no direction. Anything may import anything, so the only thing keeping a cycle or a leak out is discipline, and a linter cannot help. FSD's value here is not the folder names, it is that the allowed direction is a property of the path, which makes it checkable.

## Consequences

- A route file is a re-export and nothing else. Route segment config (`runtime`, `dynamic`) is the exception: Next.js rejects it when it is re-exported, so it is written literally in the route file.
- Steiger reports `_app` and `_pages` as typos, because it compares the raw folder name, so that rule is off for those two paths. The exemption is scoped to them.
- Most code belongs in a page slice. `features` and `entities` are earned, not created up front, and `widgets` is discouraged by the FSD layer reference itself.
- The structure is checked rather than trusted: `pnpm lint:arch` fails on an import that points the wrong way, skips a public API or names a segment after a kind of code.

The full statement of the layout, including the placement tables, is in [the FSD guide](../architecture/feature-sliced-design.md).
