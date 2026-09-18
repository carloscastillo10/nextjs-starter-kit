# `app/`: Next.js routing

This is the Next.js App Router folder. It holds routing only: every file here is a thin entry point that re-exports from the FSD layers in [`../src`](../src/README.md).

## Rules for route files

- `page.tsx` re-exports the page component from a `_pages` slice, plus `metadata`, `generateMetadata` or `generateStaticParams` when the slice provides them:

  ```tsx
  export { HomePage as default } from "@/_pages/home";
  ```

- The root `layout.tsx` is the HTML shell. It imports the global stylesheet from `@/_app/styles/globals.css` and wraps `{children}` with `Providers` from `@/_app/providers`. A nested `layout.tsx` re-exports from the `_pages` slice that owns it.
- `route.ts` re-exports handlers implemented in `@/_app/api-routes`:

  ```ts
  export { handleExample as GET } from "@/_app/api-routes";
  ```

- Route segment config (`runtime`, `maxDuration`, `dynamic`, `revalidate` and the rest) is declared as a literal in the route file itself. Next.js parses it statically, and re-exporting it fails the build.
- Route files import only from `@/_pages/*` and `@/_app/*`. When a route file needs more than a re-export, the extra code belongs in the page slice.
- Route groups `(group)` and dynamic segments `[param]` are routing concerns and live here. Components do not.

## Files that sit next to this folder

`proxy.ts` and `instrumentation.ts` go in the root of `apps/web`, beside `app/`. Next.js does not look for them inside `app/` or `src/`. Static files served at fixed URLs go to `apps/web/public/`.

See [the architecture guide](../../../docs/architecture/feature-sliced-design.md) for the full rules.
