# Feature-Sliced Design in `apps/web`

The web app organizes its code with [Feature-Sliced Design](https://fsd.how) (FSD) v2.1. This guide covers where code lives, which code may import which, how FSD fits the Next.js App Router, where the workspace packages fit, and how the structure is checked. The official FSD skill that agents follow is vendored in `.claude/skills/feature-sliced-design/`.

The rule behind every other rule: **start in the page, extract when needed.** New code goes into the page that uses it. It moves to a lower layer only when all three of these hold:

1. The same code is used in several places right now, not hypothetically.
2. It has a reason to change of its own, independent of any one consumer.
3. It has one focused responsibility.

Duplicating a little code across two pages is acceptable and is often cheaper than a premature shared abstraction.

## At a glance

```text
apps/web/
  app/                      Next.js App Router: routing only, thin re-exports
    layout.tsx              root HTML shell
    page.tsx                export { HomePage as default } from "@/_pages/home";
  src/                      FSD root (checked by Steiger)
    _app/                   app layer: providers, global styles, fonts, app-wide layouts, route handlers
    _pages/                 pages layer: one slice per screen
      home/
        ui/HomePage.tsx
        index.ts
    widgets/                widgets layer (discouraged)
    features/               features layer: reused user actions
    entities/               entities layer: reused domain models
    shared/                 shared layer: infrastructure without business rules
  steiger.config.ts         architecture linter config
  public/                   (when needed) static files served at fixed URLs, outside FSD
  proxy.ts                  (when needed) Next.js proxy, outside FSD, next to app/
```

Each layer folder has a README with its own rules: [`_app`](../../apps/web/src/_app/README.md), [`_pages`](../../apps/web/src/_pages/README.md), [`widgets`](../../apps/web/src/widgets/README.md), [`features`](../../apps/web/src/features/README.md), [`entities`](../../apps/web/src/entities/README.md), [`shared`](../../apps/web/src/shared/README.md). The routing folder has one too: [`app/`](../../apps/web/app/README.md).

A folder appears when its first file does. `_app`, `widgets`, `features`, `entities` and `shared` hold only a README until the code needs them.

## Vocabulary

- **Layer**: one of the six top-level folders in `src/`. The set and order are fixed.
- **Slice**: a folder inside `_pages`, `widgets`, `features` or `entities` that groups code by business meaning (`home`, `like-post`, `product`). `_app` and `shared` have no slices.
- **Segment**: a folder inside a slice (or directly inside `_app` and `shared`) that groups code by purpose: `ui`, `api`, `model`, `lib`, `config`, or a custom purpose name.
- **Public API**: the `index.ts` of a slice (or of a `shared` segment). Other code imports only from it.

## Next.js integration

### Why `_app` and `_pages`

Next.js uses the folder names `app/` and `pages/` for routing, and FSD uses the same names for two of its layers. Following the [FSD guide for Next.js](https://fsd.how/docs/guides/tech/with-nextjs/), the Next.js `app/` folder stays at the root of `apps/web`, the FSD layers live in `src/`, and the two colliding layers get an underscore: `src/_app` and `src/_pages`. The prefix is applied to both layers even though the project only uses the App Router.

This layout keeps the two concerns apart:

- Next.js resolves `app/` at the project root and ignores `src/app` and `src/pages` when a root `app/` exists, so nothing in `src/` ever becomes a route.
- Steiger strips the underscore when it identifies layers, so `_app` and `_pages` are checked as the app and pages layers.
- The `_` prefix has no special meaning outside `app/`. Next.js private folders (`_name` inside `app/`) are a separate convention.

### Route files stay thin

Files in `app/` are entry points. They re-export from `src/` and hold no logic of their own.

```tsx
// app/page.tsx: a page, plus the route exports its slice provides
export { HomePage as default } from "@/_pages/home";

// app/settings/page.tsx
export { SettingsPage as default, metadata } from "@/_pages/settings";

// app/products/[id]/page.tsx
export {
  ProductPage as default,
  generateMetadata,
  generateStaticParams,
} from "@/_pages/product";
```

- A page component receives the Next.js page props (`params` and `searchParams`, both promises). Type them with the generated `PageProps<"/products/[id]">` helper.
- Route segment config (`runtime`, `maxDuration`, `dynamic`, `revalidate` and the rest) is declared as a literal in the route file itself. Next.js parses it statically at build time, and re-exporting it from a slice fails the build ("It mustn't be reexported").
- The root `app/layout.tsx` is the HTML shell. It imports the global stylesheet and the providers from `_app`:

  ```tsx
  import "@/_app/styles/globals.css";
  import { Providers } from "@/_app/providers";
  ```

- A nested `layout.tsx` for a route group re-exports from the `_pages` slice that owns that group.
- Route Handlers are implemented in `src/_app/api-routes/` and re-exported:

  ```ts
  // src/_app/api-routes/index.ts
  export { handleExample } from "./handle-example";

  // app/api/example/route.ts
  export { handleExample as GET } from "@/_app/api-routes";
  ```

- Route files import only from `@/_pages/*` and `@/_app/*`. Steiger does not read `app/`, so a slice imported only from a route file would look unused. When a route file needs more than a re-export, move that code into the page slice.

### Files that live outside `src/`

| File                                    | Location                                                              | Why                                            |
| --------------------------------------- | --------------------------------------------------------------------- | ---------------------------------------------- |
| `proxy.ts` (formerly `middleware.ts`)   | `apps/web/proxy.ts`                                                   | Next.js looks for it next to the `app/` folder |
| `instrumentation.ts`                    | `apps/web/instrumentation.ts`                                         | same rule as `proxy.ts`                        |
| favicon, `robots.txt`, fixed-URL images | `apps/web/public/` or the Next.js metadata file conventions in `app/` | served as-is; not part of FSD                  |
| Framework config                        | `apps/web/next.config.ts`, `apps/web/tsconfig.json`                   | project root                                   |

### Server and client code

- Mark client components with `"use client"` in the component file itself, as close to the leaf as possible. Pages stay Server Components unless they need client state.
- A slice's `index.ts` must stay safe to import from a Client Component. If a slice also exposes server-only code (Server Components that read secrets, data access that imports `server-only`), put those exports in a second entry point, `index.server.ts`, and import it as `@/<layer>/<slice>/index.server`. Split only when that boundary is needed.

## Layers

From highest to lowest. A module may import only from layers strictly below its own.

| Layer    | Folder         | Holds                                                                            | May import from                                       |
| -------- | -------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------- |
| App      | `src/_app`     | Providers, global styles, fonts, app-wide layouts, Route Handler implementations | `_pages`, `widgets`, `features`, `entities`, `shared` |
| Pages    | `src/_pages`   | One slice per screen with its UI, data fetching, state and page-specific rules   | `widgets`, `features`, `entities`, `shared`           |
| Widgets  | `src/widgets`  | Discouraged. Large blocks several pages render that compose several features     | `features`, `entities`, `shared`                      |
| Features | `src/features` | Complete user actions (UI, request, state) reused by several consumers           | `entities`, `shared`                                  |
| Entities | `src/entities` | Domain models and rules several slices must agree on                             | `shared`                                              |
| Shared   | `src/shared`   | Infrastructure specific to this app, with no business rules                      | nothing in `src/`                                     |

Every layer may also import third-party libraries and the workspace packages (`@repo/*`).

### Notes per layer

- **`_app`** has no slices. Expected segments: `providers/`, `styles/`, `fonts/`, `layouts/`, `api-routes/`. It must not have a `ui/` segment (Steiger `fsd/no-ui-in-app`); app-wide chrome such as a header goes in `layouts/`.
- **`_pages`** holds most of the code in a young project. A page slice may contain large UI blocks, forms, validation, requests and business rules that only it uses.
- **`widgets`** is discouraged by the FSD v2.1 layer reference, because UI blocks carry logic and blur into `features`. Put a screen-specific composition in the page, a reused action in `features`, context-free UI in `shared/ui` or `@repo/ui`, and app-wide chrome in `_app/layouts`. Create a widget only when several pages render the same block, it composes several features or entities, and wiring them from each page would duplicate non-trivial logic.
- **`features`** are named after the user action (`like-post`, `sign-out`), not after where they appear (`header`).
- **`entities`** are optional. Do not create one for auth data (use `shared/auth`), for CRUD (use `shared/api`) or for transport types (keep them in `shared/api`).
- **`shared`** has no slices. Its segments are `ui`, `lib`, `api`, `config`, `auth`, plus `db` if the app ever queries a database directly. It may hold app-aware code (route paths, API endpoints, branded UI) but never a rule the product enforces on its data.

## Import rules

1. **Downward only.** `_app` → `_pages` → `widgets` → `features` → `entities` → `shared`. Importing from a higher layer is an error. Imports within one layer follow rules 2 to 4.
2. **No cross-imports between slices of the same layer.** A page never imports another page; a feature never imports another feature. Resolve the need, in this order:
   - compose both slices from the layer above (the page renders both features and passes one into the other through props or slots);
   - merge the two slices if they always change together;
   - move the shared domain part down to an entity.
3. **`@x` only in `entities`, and only as a last resort.** When two entities genuinely cannot be merged, the exporting entity adds a dedicated file for its one consumer: `entities/order/@x/customer.ts`, imported only by `entities/customer` as `@/entities/order/@x/customer`. Leave a comment explaining why merging did not work.
4. **Segments of `_app` and `shared` may import each other.** These two layers have no slices, so the rule above does not apply inside them.
5. **Through the public API.** Import `@/features/like-post`, never `@/features/like-post/ui/LikeButton`.
6. **Alias across, relative within.** Use `@/` for anything outside the current slice; use relative paths (`./ui/HomePage`) inside it. Inside `_app` and `shared` both forms are accepted, because code generated by the shadcn CLI uses the alias.

## Public API

- Every slice has an `index.ts` at its root that re-exports what other code may use. Prefer explicit named re-exports (`export { LikeButton } from "./ui/LikeButton";`) over `export *`, so the surface stays visible and intentional.
- `shared` has no top-level `index.ts`. Each segment has its own public API instead:
  - `shared/api`, `shared/config` and `shared/auth` each have an `index.ts`.
  - `shared/ui` and `shared/lib` are libraries of unrelated modules, so each module is its own entry point: a flat file (`@/shared/ui/button`) or a folder with an `index.ts` (`@/shared/ui/data-table`). Reaching past that folder's index is still a violation.
- No layer has an `index.ts` of its own. Steiger enforces this for every layer except `_app` (`fsd/no-layer-public-api`); in `_app`, each segment exposes its own `index.ts` instead.
- A slice may add `index.server.ts` for server-only exports (see [Server and client code](#server-and-client-code)).

## Naming

- **Layers**: fixed names, `_app`, `_pages`, `widgets`, `features`, `entities`, `shared`.
- **Slices**: kebab-case. Pages are named after the screen (`home`, `sign-in`, `user-settings`), features after the action (`like-post`, `add-to-cart`), entities after a singular noun (`product`, `invoice`).
- **Slice groups**: when a layer grows hard to scan, related slices may share a parent folder (`_pages/orders/list`, `_pages/orders/detail`). The group folder has no `index.ts`, no segments and no shared code, and siblings inside it still may not import each other.
- **Segments**: the standard names `ui`, `api`, `model`, `lib`, `config`, or a custom name that states a purpose (`auth`, `db`, `styles`, `fonts`, `layouts`, `api-routes`, `providers`). Names that describe a kind of code are rejected by Steiger (`fsd/segments-by-purpose`): `components`, `hooks`, `utils`, `helpers`, `types`, `constants`, `services`, `store`, `handlers`, `assets` and similar. The only exemption is `_app/providers`, the name the FSD guide for Next.js uses.
- **Files**: named after the domain they serve, not their technical role. `model/order.ts` and `api/fetch-profile.ts`, not `model/types.ts` or `lib/helpers.ts`. When a segment serves a single concern, the file may repeat the slice name (`features/sign-out/model/sign-out.ts`).
- **File case**: React component files use PascalCase (`HomePage.tsx`); every other module uses kebab-case (`fetch-profile.ts`). Files generated by the shadcn CLI keep the names it gives them.
- **Exports and code style**: named exports, arrow functions and the rest of the code conventions are in [docs/conventions/code-style.md](../conventions/code-style.md).

## Path aliases

`apps/web/tsconfig.json` maps a single alias to the FSD root:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Imports therefore name the layer explicitly: `@/_app/providers`, `@/_pages/home`, `@/features/like-post`, `@/entities/product`, `@/shared/api`. There is no alias to the project root, so nothing can import a route file by accident. Next.js reads the mapping from `tsconfig.json`; no bundler configuration is needed.

## Where `packages/*` fit

The monorepo can hold shared workspace packages under `packages/*`, named `@repo/<name>` (for example `@repo/ui` with the shadcn/ui primitives).

- Packages sit outside the FSD layers. To the app they behave like third-party libraries: any layer, including `shared`, may import them through their package exports.
- A package never imports from an app and knows nothing about any app's routes, domain or business rules.
- `src/shared` holds the infrastructure that is specific to this app: its route paths, environment access, API client, branded UI compositions.
- Code moves from `src/shared` into a package only when a second app needs it. Moving it earlier adds a package boundary with no second consumer.
- Do not wrap package exports in `src/shared` just to re-export them. Import `@repo/ui/components/button` directly; add a component to `src/shared/ui` only when it adds something app-specific.

## Placement guide

| What                                            | Where                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| A screen                                        | `src/_pages/<screen>/`, re-exported by `app/<route>/page.tsx`                                     |
| UI, state or requests used by one screen        | inside that screen's slice (`ui/`, `model/`, `api/`)                                              |
| A Server Action                                 | the `api/` segment of the slice that owns the action, in a file that starts with `"use server"`   |
| A user action reused by several pages           | `src/features/<action>/`                                                                          |
| A domain rule several slices must agree on      | `src/entities/<noun>/model/`                                                                      |
| HTTP client, requests several slices call, DTOs | `src/shared/api/`                                                                                 |
| Environment access, route paths, app settings   | `src/shared/config/`                                                                              |
| Generic helpers (formatting, class names)       | `src/shared/lib/`                                                                                 |
| App-specific UI with no business context        | `src/shared/ui/`                                                                                  |
| Design-system primitives shared by apps         | the `@repo/ui` package                                                                            |
| Global stylesheet (Tailwind entry, app tokens)  | `src/_app/styles/globals.css`, imported once in `app/layout.tsx`                                  |
| Fonts (`next/font`)                             | `src/_app/fonts/`, applied in `app/layout.tsx`                                                    |
| Global providers (theme, auth)                  | `src/_app/providers/`, exposed as `Providers` from its `index.ts` and mounted in `app/layout.tsx` |
| App-wide chrome (a header on every route)       | `src/_app/layouts/`, rendered from `app/layout.tsx`                                               |
| Route Handler implementation                    | `src/_app/api-routes/`, re-exported by `app/api/<name>/route.ts`                                  |
| Proxy (auth checks, redirects)                  | `apps/web/proxy.ts`                                                                               |
| An image used by one component                  | next to that component, in its `ui/` segment                                                      |
| favicon, `robots.txt`, fixed-URL images         | `apps/web/public/` or the Next.js metadata files in `app/`                                        |
| Tests                                           | inside the slice or segment they cover; a test never reaches into another slice's internals       |

### shadcn/ui

With the primitives in a `@repo/ui` package, the app's `apps/web/components.json` points its aliases at FSD locations:

| Alias        | Value                 | What lands there                        |
| ------------ | --------------------- | --------------------------------------- |
| `ui`         | `@repo/ui/components` | primitives (`button`, `dialog`)         |
| `utils`      | `@repo/ui/lib/utils`  | the `cn` helper                         |
| `components` | `@/shared/ui`         | blocks and app-level compositions       |
| `lib`        | `@/shared/lib`        | app helpers                             |
| `hooks`      | `@/shared/lib`        | app hooks (there is no `hooks` segment) |

If the primitives live in the app instead, point `ui` at `@/shared/ui` and `utils` at `@/shared/lib/utils`. Either way:

- a block the CLI adds to `src/shared/ui` that carries logic for one screen (a login form, a dashboard section) moves into that screen's `_pages` slice;
- the global stylesheet the CLI writes or extends is `src/_app/styles/globals.css`, or the `@repo/ui` stylesheet that it imports.

### Authentication (Clerk)

| What                                                                   | Where                                                                                                                                           |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `<ClerkProvider>` and its `appearance`                                 | `src/_app/providers/`, composed into `Providers`                                                                                                |
| `clerkMiddleware()`                                                    | `apps/web/proxy.ts`                                                                                                                             |
| Sign-in and sign-up screens                                            | `src/_pages/sign-in/` and `src/_pages/sign-up/`, re-exported by `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` |
| Session helpers, auth route paths                                      | `src/shared/auth/` (`index.ts`, plus `index.server.ts` for helpers that call server-only APIs)                                                  |
| An auth action reused by several pages (for example a sign-out button) | `src/features/<action>/`; while one page uses it, keep it in that page                                                                          |
| Clerk webhooks                                                         | `src/_app/api-routes/`, re-exported by `app/api/webhooks/<name>/route.ts`                                                                       |

Do not create a `user` entity only to wrap the session. An entity appears when the product has user-domain rules that several slices must share.

## Recipes

### Add a page

1. Create the slice: `src/_pages/<screen>/ui/<Screen>Page.tsx`.
2. Expose it: `src/_pages/<screen>/index.ts` with `export { <Screen>Page } from "./ui/<Screen>Page";`.
3. Add the route: `app/<route>/page.tsx` with `export { <Screen>Page as default } from "@/_pages/<screen>";`. Re-export `metadata` or `generateMetadata` too if the slice exports them.
4. Keep everything the screen needs inside the slice, in `ui/`, `model/`, `api/`, `lib/` or `config/` as it grows.
5. Run `pnpm --filter web lint:arch` and `pnpm build`.

### Extract code to a lower layer

1. Confirm the three conditions of the extraction rule. A second copy of similar code is not enough if the copies will drift apart for their own reasons.
2. Pick the target:
   - a complete user action goes to `features`;
   - a domain model or rule goes to `entities`;
   - infrastructure with no business rules goes to `shared`.
3. Move the code into the right segment of the new slice, export it from the slice's `index.ts`, and update the consumers to import from the public API.
4. Run `pnpm --filter web lint:arch`. `fsd/insignificant-slice` fails if the new slice has fewer than two consumers (a slice used only from `_app` is fine).

### Add a global provider

1. Create the provider in `src/_app/providers/`. Mark it `"use client"` only if it needs client state.
2. Compose it inside the `Providers` component exported by `src/_app/providers/index.ts`.
3. `app/layout.tsx` already wraps `{children}` with `Providers`; if not, add the import from `@/_app/providers`.

### Add a Route Handler

1. Implement the handler in `src/_app/api-routes/<name>.ts` and export it from `src/_app/api-routes/index.ts`.
2. Create `app/api/<name>/route.ts` that re-exports it under the HTTP method name, for example `export { handleExample as GET } from "@/_app/api-routes";`.
3. Keep domain rules out of the handler: delegate to the slice that owns them.

## Architecture linter

[Steiger](https://github.com/feature-sliced/steiger), the official FSD linter, checks `src/`:

```bash
pnpm --filter web lint:arch
```

It runs `steiger ./src` with the recommended rules of `@feature-sliced/steiger-plugin`, configured in `apps/web/steiger.config.ts`. Among other things it rejects:

- imports from a higher layer or from a sibling slice (`fsd/forbidden-imports`);
- imports that bypass a public API (`fsd/no-public-api-sidestep`);
- slices without `index.ts` and `shared` segments without a public API (`fsd/public-api`);
- segment names that describe a kind of code (`fsd/segments-by-purpose`);
- a `ui` segment in `_app` (`fsd/no-ui-in-app`);
- features, entities and widgets with fewer than two consumers (`fsd/insignificant-slice`);
- slices without segments, too many ungrouped slices, and similar structural issues.

The config exempts two cases, each limited to the paths involved:

- `fsd/typo-in-layer-name` is off for `src/_app` and `src/_pages`. The rule compares the raw folder name and reports the underscore prefix that the FSD guide for Next.js prescribes as a typo.
- `fsd/segments-by-purpose` is off for `src/_app/providers`. The rule's list of banned names includes `providers`, which the FSD guide for Next.js uses for the app-wide provider segment.

`fsd/import-locality` (relative imports inside a slice, alias across slices) is disabled in the recommended config and stays disabled: inside `shared` it would reject the alias imports that the shadcn CLI generates. The convention still applies; code review enforces it.

Steiger only reads `src/`. The rule that route files in `app/` import only from `_pages` and `_app` is a convention outside its reach.

## References

- [FSD documentation](https://fsd.how) and [layer reference](https://fsd.how/docs/reference/layers/)
- [FSD guide for Next.js](https://fsd.how/docs/guides/tech/with-nextjs/)
- [Steiger](https://github.com/feature-sliced/steiger)
- Official FSD agent skill, vendored in `.claude/skills/feature-sliced-design/`
