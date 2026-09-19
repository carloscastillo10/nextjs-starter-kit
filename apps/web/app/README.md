# 🧭 app

> The Next.js App Router folder: routing only, every file a thin entry point that re-exports from `src/`.

## 🎯 Purpose

Routing is a framework concern, and application code is not. Keeping them in separate folders means a screen
can be moved, renamed or shared without touching a route, and a route file stays small enough that nobody is
tempted to put logic in it.

**Route files import only from `@/_pages/*` and `@/_app/*`**, and only through a public API. ESLint reports
anything else, so the routing folder stays a leaf of the import graph rather than a layer of its own.

## 🗂️ Structure

| File                         | What it is                                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| [`layout.tsx`](./layout.tsx) | The HTML shell: imports the global stylesheet, applies the fonts, wraps `{children}` in `Providers` |
| [`page.tsx`](./page.tsx)     | One line, re-exporting the page component of a `_pages` slice                                       |
| `route.ts`                   | One line, re-exporting a handler implemented in `@/_app/api-routes`                                 |
| `(group)/`, `[param]/`       | Route groups and dynamic segments: routing concerns, so they live here                              |

## 🚀 Usage

```tsx
// app/page.tsx
export { HomePage as default } from "@/_pages/home";
```

```ts
// app/api/example/route.ts
export { handleExample as GET } from "@/_app/api-routes";
```

A nested `layout.tsx` re-exports from the `_pages` slice that owns it. When a route file needs more than a
re-export, the extra code belongs in the page slice, not here.

> [!IMPORTANT]
> **Route segment config is written as a literal in the route file** — `dynamic`, `revalidate`, `runtime`,
> `maxDuration`. Next.js parses it statically, so re-exporting it fails the build with "It mustn't be
> reexported". `metadata`, `generateMetadata` and `generateStaticParams` may be re-exported.

## 🧩 Extending

- **A new screen** is a slice in [`../src/_pages/`](../src/_pages/README.md) plus the route file that
  re-exports it.
- **Files Next.js only finds beside this folder** — `proxy.ts`, `instrumentation.ts` — go in the root of
  `apps/web`, not inside `app/` and not inside `src/`. Next.js resolves them from the parent of the `app`
  directory.
- **Static files served at a fixed URL** go in `apps/web/public/`. Metadata files that Next.js generates
  from conventions — `favicon.ico`, `robots.ts`, the Open Graph image — belong here.

## 🔗 Related

- [src](../src/README.md): the layers every route file re-exports from
- [Feature-Sliced Design](../../../docs/architecture/feature-sliced-design.md): the full rules
- [apps/web](../README.md): the app itself, its configuration and its commands
