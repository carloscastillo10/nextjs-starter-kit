# 🏛️ \_app

> The app layer: everything that makes the application run as a whole, mounted once.

## 🎯 Purpose

The Feature-Sliced Design **app** layer, renamed `_app` so it never collides with the Next.js `app/` routing
folder. It holds what the whole application shares and no single screen owns: the providers, the stylesheet,
the fonts, the chrome, the values the root metadata reads.

It has no slices. It is split into segments, and a segment is created when its first file arrives.

## 🗂️ Structure

| Segment       | Holds                                                                                                                                     |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `providers/`  | Context providers mounted once for the whole app. `index.ts` exposes a single `Providers` that `app/layout.tsx` wraps around `{children}` |
| `styles/`     | `globals.css`: the Tailwind entry point, the `@source` lines, and the app's own styles. Imported once, from `app/layout.tsx`              |
| `fonts/`      | `next/font` definitions, applied to `<html>` or `<body>` in `app/layout.tsx`                                                              |
| `metadata/`   | Values the root metadata reads, such as the site URL that relative Open Graph and canonical URLs resolve against                          |
| `layouts/`    | App-wide chrome rendered on every route, such as a site header                                                                            |
| `api-routes/` | Route Handler implementations. `app/api/<name>/route.ts` re-exports them                                                                  |

Four of the six segments exist today:

```text
_app/
├── fonts/
│   ├── index.ts
│   └── sans.ts            Geist, as the --font-sans variable
├── metadata/
│   ├── index.ts
│   └── site-url.ts        the origin relative metadata resolves against
├── providers/
│   ├── Providers.tsx
│   └── index.ts           export { Providers } from "./Providers";
└── styles/
    └── globals.css        the Tailwind entry point and the @source lines
```

> [!NOTE]
> The **design tokens are not here.** Colors, radii and fonts are defined once in
> [`@repo/tailwind-config`](../../../../tooling/tailwind/README.md); `styles/globals.css` imports that theme
> and the UI kit, and adds only what belongs to this app.

## 🚀 Usage

Imports:

- May import from `_pages`, `widgets`, `features`, `entities` and `shared`.
- Segments inside `_app` may import each other.
- **Nothing inside `src/` imports from `_app`.** Only the route files in `app/` do.

## 🧩 Extending

What does not belong here:

- **UI or logic used by one screen**: it belongs to that screen's `_pages` slice.
- **A `ui/` segment**: Steiger rejects it (`fsd/no-ui-in-app`). App-wide chrome goes in `layouts/`.
- **Business rules**: they live in the slice that owns them.
- **`proxy.ts` and `instrumentation.ts`**: Next.js only finds them beside the `app/` folder, at the root of
  `apps/web`.

A new provider is composed inside the existing `Providers` rather than added as a second wrapper in
`layout.tsx`, so the route file keeps one import instead of growing one per dependency.

## 🔗 Related

- [`src/`](../README.md): the six layers and the import rule between them
- [Feature-Sliced Design in `apps/web`](../../../../docs/architecture/feature-sliced-design.md): the full placement table
- [`@repo/tailwind-config`](../../../../tooling/tailwind/README.md) and [`DESIGN.md`](../../../../DESIGN.md): where the tokens live
