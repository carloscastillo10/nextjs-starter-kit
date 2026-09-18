# `_app`: app layer

Everything that makes the application run as a whole. It is the FSD **app** layer, renamed `_app` so it does not collide with the Next.js `app/` routing folder.

## What goes here

The layer has no slices; it is split into segments. Create a segment when its first file arrives:

- `providers/`: context providers mounted once for the whole app (theme, authentication). `providers/index.ts` exposes a single `Providers` component that `app/layout.tsx` wraps around `{children}`.
- `styles/`: the global stylesheet `globals.css` (Tailwind entry point and app-level design tokens), imported once from `app/layout.tsx`.
- `fonts/`: `next/font` definitions, applied to `<html>` or `<body>` in `app/layout.tsx`.
- `metadata/`: values the root metadata in `app/layout.tsx` reads, such as the site URL that relative Open Graph and canonical URLs resolve against.
- `layouts/`: app-wide chrome rendered on every route, such as a site header.
- `api-routes/`: Route Handler implementations. `app/api/<name>/route.ts` re-exports them.

## What does not go here

- UI or logic used by one screen: it belongs to that screen's `_pages` slice.
- A `ui/` segment: Steiger rejects it (`fsd/no-ui-in-app`). App-wide chrome goes in `layouts/`.
- Business rules: they live in the slice that owns them.
- `proxy.ts` and `instrumentation.ts`: Next.js only finds them next to the `app/` folder, at the root of `apps/web`.

## Imports

- May import from `_pages`, `widgets`, `features`, `entities` and `shared`.
- Segments inside `_app` may import each other.
- Nothing inside `src/` imports from `_app`. Only the Next.js route files in `app/` do.

## Example

```text
_app/
  providers/
    Providers.tsx
    index.ts          <- export { Providers } from "./Providers";
  styles/
    globals.css
```

See [the architecture guide](../../../../docs/architecture/feature-sliced-design.md) for the full placement table.
