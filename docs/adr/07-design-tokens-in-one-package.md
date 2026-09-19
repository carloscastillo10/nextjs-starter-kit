---
tags: [adr, design, tailwind, tokens]
aliases: [ADR 07, Design tokens in one package]
status: accepted
---

# Every design token lives in one Tailwind CSS v4 package

[`@repo/tailwind-config`](../../tooling/tailwind/README.md) owns `theme.css`: the Tailwind entry point, every
color, radius and font token in `:root` and `.dark`, the `@theme inline` block that turns them into
utilities, and the PostCSS configuration. [`@repo/ui`](../../packages/ui/README.md) and `apps/web` both import
it, and neither defines a token of its own. [`DESIGN.md`](../../DESIGN.md) documents those values and is
changed in the same commit as the stylesheet.

Tailwind v4 is configured in CSS, so there is no `tailwind.config.ts` to share and a JavaScript preset would
have nothing to hold. The shared unit is a stylesheet, and the package is what makes it importable by name
rather than by a relative path that breaks when a workspace moves.

## Considered options

**Tokens in `@repo/ui`.** Rejected: an app that wants the theme without the components would then depend on
the component library, and the shadcn CLI writes new variables into the file that `components.json` points
at — which would put app-level tokens inside the UI package.

**A Tailwind v3 JavaScript preset**, as several older repositories do. Rejected: v4 reads its theme from CSS,
and shadcn/ui v4 emits OKLCH variables and `tw-animate-css`. Porting the preset would mean maintaining a
translation layer between two versions of the same idea.

**Exporting tokens to `tokens.json` for other tools.** Rejected: a second generated copy of the same values,
with nothing checking that it is current.

## Consequences

- Tailwind runs with `source(none)`, so every stylesheet declares its own `@source` directories. A new folder
  whose classes should be built has to be added there, or its utilities are silently missing from the build.
- The shadcn CLI is run from `apps/web`, and writes components into `packages/ui` and variables into
  `theme.css`, because both `components.json` files point there.
- A token and its entry in `DESIGN.md` are one change. `pnpm lint:design` is not wired, so the check is the
  review and the `doc-steward` lens.
- The `theme-color` meta tag duplicates a background value, because a meta tag cannot read a CSS variable.
  That duplication is recorded in `DESIGN.md`.
