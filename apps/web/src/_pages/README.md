# 📄 \_pages

> The pages layer: one slice per screen, and where most code starts its life.

## 🎯 Purpose

The Feature-Sliced Design **pages** layer, renamed `_pages` so Next.js never reads it as a Pages Router
folder. A page slice owns its UI, its forms and validation, its data fetching, its state and the rules that
belong to that screen — **even when some of it looks reusable**. Code moves down a layer when a second
consumer appears, not when somebody predicts one.

## 🗂️ Structure

One folder per screen, kebab-case, named after the screen: `home`, `sign-in`, `user-settings`. When a topic
has many screens, a group folder without an `index.ts` may hold them: `orders/list`, `orders/detail`.

```text
_pages/
  home/
    ui/
      HomePage.tsx
    index.ts          <- export { HomePage } from "./ui/HomePage";
```

## 🚀 Usage

The route file for the screen re-exports the slice and does nothing else:

```tsx
// app/page.tsx
export { HomePage as default } from "@/_pages/home";
```

Imports:

- May import from `widgets`, `features`, `entities` and `shared`.
- **Never from another `_pages` slice**, and never from `_app`. Two screens that need the same thing are the
  signal to move it down, not to import sideways.

## 🧩 Extending

What does not belong here:

- **Routing**: `page.tsx`, `layout.tsx` and `route.ts` live in [`app/`](../../app/README.md) and only
  re-export.
- **Code that has earned a lower layer**: a user action reused by several pages goes to `features`, a domain
  model several slices must agree on goes to `entities`, infrastructure with no business rules goes to
  `shared`.

Inside a slice, the segments are the ones the standard names: `ui/` for components, `model/` for state and
hooks, `api/` for requests, `lib/` for pure helpers, `config/` for named values.

## 🔗 Related

- [`src/`](../README.md): the six layers and the import rule between them
- [`app/`](../../app/README.md): the route files that re-export these slices
- [Feature-Sliced Design in `apps/web`](../../../../docs/architecture/feature-sliced-design.md): the full rules
