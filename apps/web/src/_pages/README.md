# `_pages`: pages layer

One slice per screen. It is the FSD **pages** layer, renamed `_pages` so Next.js never reads it as a Pages Router folder.

## What goes here

Most of the code, at first. A page slice owns its UI, forms, validation, data fetching, state and page-specific business rules, even when some of it looks reusable. The Next.js route file for the screen re-exports the page from here.

## What does not go here

- Routing: `page.tsx`, `layout.tsx` and `route.ts` live in `app/` and only re-export.
- Code that has earned a lower layer: a user action reused by several pages (`features`), a domain model several slices must agree on (`entities`), infrastructure with no business rules (`shared`).
- Imports from another page slice.

## Imports

- May import from `widgets`, `features`, `entities` and `shared`.
- Never from another `_pages` slice or from `_app`.

## Slice naming

kebab-case, named after the screen: `home`, `sign-in`, `user-settings`. When a topic has many screens, a slice group folder without `index.ts` may hold them (`orders/list`, `orders/detail`).

## Example

```text
_pages/
  home/
    ui/
      HomePage.tsx
    index.ts          <- export { HomePage } from "./ui/HomePage";
```

```tsx
// app/page.tsx
export { HomePage as default } from "@/_pages/home";
```

See [the architecture guide](../../../../docs/architecture/feature-sliced-design.md) for the full rules.
