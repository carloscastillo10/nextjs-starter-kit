---
tags: [integrations, clerk, authentication]
aliases: [Clerk, Authentication, Clerk integration]
---

# 🔐 Clerk

> Authentication for `apps/web`: where each piece lives, where the keys go, how to protect a route, and what changes in production.

![Clerk](https://img.shields.io/badge/@clerk/nextjs-7-6C47FF?logo=clerk&logoColor=white)
![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)

## 🧭 Table of contents

- [🎯 What is wired](#-what-is-wired)
- [🔑 Keys](#-keys)
- [🛡️ Protecting a route](#️-protecting-a-route)
- [🎨 Appearance](#-appearance)
- [🚀 Production](#-production)
- [⚠️ Pitfalls](#️-pitfalls)
- [🔗 Related](#-related)

## 🎯 What is wired

| Piece                                  | File                                                               | Notes                                                                |
| -------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `clerkMiddleware()`                    | `apps/web/proxy.ts`                                                | Resolves the session on every request; decides nothing about access  |
| `<ClerkProvider>` and its `appearance` | `apps/web/src/_app/providers/`                                     | Inside `Providers`, around the theme provider                        |
| Sign-in and sign-up paths              | `apps/web/src/shared/auth/`                                        | `SIGN_IN_PATH`, `SIGN_UP_PATH`, passed to the provider and the proxy |
| Sign-in and sign-up screens            | `apps/web/src/_pages/sign-in/`, `apps/web/src/_pages/sign-up/`     | `<SignIn />` and `<SignUp />`, routed by optional catch-all folders  |
| Session in the header                  | `apps/web/src/_app/layouts/SiteHeader.tsx`                         | Sign-in and sign-up links when signed out, `<UserButton />` when in  |
| Key validation                         | `packages/env` (`clerkEnv`), called from `apps/web/next.config.ts` | Fails the build on a malformed key, passes with none                 |

The header reads the session on the server, so every route renders on request (`ƒ` in the build output).

## 🔑 Keys

Two variables, both from the **API keys** page of your application in the [Clerk Dashboard](https://dashboard.clerk.com/~/api-keys):

| Variable                            | Kind   | Starts with                        |
| ----------------------------------- | ------ | ---------------------------------- |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | public | `pk_test` (development), `pk_live` |
| `CLERK_SECRET_KEY`                  | secret | `sk_test` (development), `sk_live` |

1. Create an application in the Clerk Dashboard (a development instance comes with it).
2. Copy `.env.example` from the repository root to `.env.dev` in the same folder. The file is git-ignored.
3. Paste the two keys and run `pnpm dev`.

`apps/web/next.config.ts` loads `.env.dev` from the repository root before Next.js reads `process.env`, so the publishable key is inlined into the client bundle and the secret key reaches the server. A variable already set in the shell wins over the file, and `apps/web/.env.local`, which Next.js reads on its own, also wins over it. See [`@repo/env`](../../packages/env/README.md) for the full order.

> [!TIP]
> With the [Clerk CLI](https://clerk.com/docs/cli.md), an account holder can write the keys straight to the root file: from `apps/web`, run `pnpm dlx clerk@latest auth login`, then `pnpm dlx clerk@latest link`, then `pnpm dlx clerk@latest env pull --file ../../.env.dev`.

> [!WARNING]
> `clerk init` is built for a project without Clerk. In this template it adds a second `<ClerkProvider>` to `app/layout.tsx`, adds a `.gitignore` to `apps/web`, and writes route variables next to the keys in `apps/web/.env.local`. If you use it to get temporary keys without an account, keep `apps/web/.env.local`, revert its changes to tracked files, and never commit the `.clerk/` folder it creates: it holds the token that claims the application.

### Without keys

- `pnpm build` passes with no Clerk variables and with empty ones, which is what CI and forks have. An empty value counts as unset.
- `pnpm dev` and `pnpm start` answer every page with a 500 and Clerk's message asking for keys. Since `@clerk/nextjs` 7.8.0 the SDK no longer starts a keyless session on its own.
- A key of the wrong shape (for example the two keys swapped) stops `next build` and `next dev` with the name of the variable and what was expected. The value is never printed.

## 🛡️ Protecting a route

**Every route is public until the code that serves it checks the session.** The proxy runs Clerk on each request but never decides access; each resource that needs a signed-in user checks for one itself, first thing. This is the model Clerk recommends: it deprecated `createRouteMatcher()` because a check in the proxy can be bypassed, and Server Actions are called by ID, so a path matcher never sees them.

| Resource                               | Check                                                      | A signed-out request gets                               |
| -------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- |
| Page (`src/_pages/<slice>/ui/`)        | `await auth.protect();`                                    | 307 to `/sign-in?redirect_url=…`                        |
| Nested layout that loads user data     | `await auth.protect();` in the layout **and** each page    | Same; a layout does not always re-render with its pages |
| Route Handler (`src/_app/api-routes/`) | `const { isAuthenticated } = await auth();` and return 401 | 401 with a JSON body                                    |
| Server Action (`"use server"`)         | `await auth.protect();`                                    | 401                                                     |

A page, in its `_pages` slice:

```tsx
import { auth } from "@clerk/nextjs/server";

export const DashboardPage = async () => {
  await auth.protect();

  return <main>…</main>;
};
```

A Route Handler, implemented in `src/_app/api-routes/` and re-exported by `app/api/<name>/route.ts`:

```ts
import { auth } from "@clerk/nextjs/server";

export const handleProfile = async () => {
  const { isAuthenticated, userId } = await auth();

  if (!isAuthenticated) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json({ userId });
};
```

- **Roles and permissions**: `await auth.protect({ permission: "org:invoices:create" })`, or `has()` from `auth()` for a 403 of your own. Prefer permissions over roles.
- **Hiding UI**: `<Show when="signed-in">` or `<Show when={{ permission: "…" }}>` hides markup only. The data behind it still needs a check on the server.
- **Redirecting early** (optional): once every resource checks the session, the proxy may redirect signed-out visitors away from a path to save a round trip. It is a speed-up, never the check itself; see Clerk's [migration guide](https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher.md).

> [!NOTE]
> Clerk's lint rule for this, `@clerk/next/require-auth-protection`, is not enabled. It is experimental, and it cannot follow a re-export, which is what every route file in this app is; its only escape hatch is an inline `eslint-disable`, which the repository does not allow.

## 🎨 Appearance

`apps/web/src/_app/providers/clerk-appearance.ts` points Clerk's `variables` at the theme's CSS variables (`--primary`, `--card`, `--muted-foreground`, `--radius`…), so the Clerk screens and the user menu follow the light and dark tokens and change with them. The values mirror Clerk's `shadcn` theme. Its package, `@clerk/ui`, is not installed: it pulls a React Native and Solana wallet tree into the install for a mapping of a dozen values.

Clerk's styles go in the `components` CSS layer (`cssLayerName`), below Tailwind's utilities, so the classes in `elements` override them. To restyle one part of a Clerk component, add its key to `elements` with utility classes; to change a color everywhere, change the token in the shared theme instead.

## 🚀 Production

1. In the hosting project (Vercel: **Settings › Environment Variables**), add both keys for each environment. Use the variable names above; nothing is read from files there.
2. Set them **before** building: the publishable key is inlined at build time, so a deployment built without it has no key in its client code.
3. Development keys work on the host's preview domain (such as `*.vercel.app`). Production keys (the `live` ones) need a Clerk production instance and a domain you own; `*.vercel.app` cannot host one.

CI builds the app with the two keys from repository secrets when they exist and as empty strings when they do not; both builds pass.

## ⚠️ Pitfalls

Checked on 2026-09-18 with `@clerk/nextjs` 7.9.4 and Next.js 16.3.5.

| Pitfall                                           | What happens                                                                                                                                                                                 | Source                                                                                                                           |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| No keyless mode                                   | Missing keys in development throw instead of creating a temporary instance                                                                                                                   | [changelog, 7.8.0](https://github.com/clerk/javascript/blob/main/packages/nextjs/CHANGELOG.md)                                   |
| `createRouteMatcher()` is deprecated              | It still works, logs a warning in development, and goes away in the next major                                                                                                               | [migration guide](https://clerk.com/docs/guides/development/upgrading/upgrade-guides/migrate-from-create-route-matcher.md)       |
| `auth.protect()` in a Route Handler redirects     | The docs promise a 404 for non-document requests; on Next.js 16 every Route Handler counts as a page, so a signed-out API call gets a 307 to the sign-in page. Check `auth()` and return 401 | [`auth.protect()` reference](https://clerk.com/docs/nextjs/reference/app-router/auth.md#auth-protect), observed on a local route |
| Development handshake                             | A request that accepts `text/html` without Clerk's development cookie is redirected once to the instance's `accounts.dev` domain and back                                                    | [development and production instances](https://clerk.com/docs/guides/development/managing-environments.md)                       |
| `clerk init` rewires an app it does not recognize | It adds a second provider to the root layout of this template                                                                                                                                | observed with the CLI 3.3.0                                                                                                      |
| Production keys on `*.vercel.app`                 | Not allowed; a production instance needs your own domain                                                                                                                                     | [deploying to Vercel](https://clerk.com/docs/guides/development/deployment/vercel.md)                                            |

## 🔗 Related

- [`@repo/env`](../../packages/env/README.md): the env contract and `.env.example`
- [Feature-Sliced Design guide](../architecture/feature-sliced-design.md): where auth code lives in the app
- [Clerk Next.js reference](https://clerk.com/docs/reference/nextjs/overview)
