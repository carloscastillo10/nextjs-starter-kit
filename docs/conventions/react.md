---
tags: [conventions, react, nextjs, tailwind]
aliases: [React conventions, React and Next.js conventions]
---

# React and Next.js

How components, hooks and pages are written in `apps/web` (Next.js App Router, React 19, Server Components by default). The general TypeScript rules are in [code-style.md](code-style.md) and apply here too; where code lives is decided by [Feature-Sliced Design](../architecture/feature-sliced-design.md).

The performance rules follow Vercel's React best practices and composition patterns, vendored as the agent skills `vercel-react-best-practices` and `vercel-composition-patterns` in `.claude/skills/`. Read those for the full catalog with measurements; this document keeps the rules that shape everyday code here.

## Contents

- [Server and Client Components](#server-and-client-components)
- [Component shape](#component-shape)
- [Props](#props)
- [Hooks](#hooks)
- [State and memoization](#state-and-memoization)
- [Composition](#composition)
- [Data fetching and performance](#data-fetching-and-performance)
- [Next.js specifics](#nextjs-specifics)
- [Styling](#styling)
- [Accessibility](#accessibility)
- [Enforcement](#enforcement)

## Server and Client Components

- **Everything is a Server Component until it needs the client.** A component becomes a Client Component only for state, effects, event handlers or browser APIs.
- **`"use client"` goes on the leaf, never on the page.** Keep pages and layouts on the server and push the directive down to the smallest component that needs it. A new file starts without it.
- **Pass Client Components the minimum.** Everything crossing the boundary is serialized into the page: send the three fields the component reads, not the whole record, and do not send the same data twice.
- **Keep secrets and server-only code out of client bundles.** A module that reads secrets imports `server-only`, and a slice that exposes such code does it through `index.server.ts` (see the [FSD guide](../architecture/feature-sliced-design.md#server-and-client-code)).

## Component shape

A Client Component is three steps: call its hook, destructure what it returns, return JSX.

```tsx
// _pages/login/ui/LoginForm.tsx
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";
import type { ComponentProps } from "react";

import { useLoginForm } from "../model/use-login-form";

type LoginFormProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (email: string) => void;
};

export const LoginForm = ({ className, onSubmit, ...props }: LoginFormProps) => {
  const { email, errorMessage, isSubmitDisabled, handleEmailChange, handleSubmit } = useLoginForm({
    onSubmit,
  });

  return (
    <form className={cn("grid gap-4", className)} onSubmit={handleSubmit} {...props}>
      <Label className="grid gap-2">
        Email
        <Input type="email" value={email} onChange={handleEmailChange} />
      </Label>
      {errorMessage ? <p role="alert">{errorMessage}</p> : null}
      <Button disabled={isSubmitDisabled} type="submit">
        Sign in
      </Button>
    </form>
  );
};
```

- **An arrow function, exported by name**, one component per file, the file named after it.
- **No state or effects in the component file.** `useState`, `useReducer`, `useEffect`, `useLayoutEffect`, `useCallback`, `useTransition`, `useActionState` and `useOptimistic` belong in the component's hook (`model/`). Two cases may call hooks directly: a provider in `_app/providers` that wires effects (see [Hooks](#hooks)), and a lookup map of renderers that needs props (see below).
- **No `if` in the body.** Branch inside the returned JSX: `{isReady ? <Content /> : <Skeleton />}`, or `{isOpen ? <Panel /> : null}`. Guard clauses belong in hooks and in `lib/`. The one exception is a Server Component that stops rendering through Next.js navigation, which is not a branch of the JSX:

  ```tsx
  export const ProductPage = async ({ params }: PageProps<"/products/[id]">) => {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) notFound();

    return (
      <main>
        <h1>{product.name}</h1>
      </main>
    );
  };
  ```

  The same applies to `redirect`, `permanentRedirect`, `forbidden` and `unauthorized`.

- **No computation in JSX props.** Arithmetic and comparisons (`width={base + extra}`, `disabled={count === 0}`), a fallback (`label={title ?? fallback}`), an object or an array written in place (`style={{ width }}`, `items={[first, second]}`), a ternary (`aria-label={isOpen ? "Close" : "Open"}`), a template literal with an expression, `&&`, `||`, and a list built there (`rows={items.map(toRow)}`) are all logic: compute them in the hook, or name them as a constant.

  What the rule asks for is that the value the prop receives carries a name, so a call to a named function is one. A conditional class inside `cn(...)` stays the way to write a conditional class, and so does the kit's variant call:

  ```tsx
  <span className={cn("tab", isActive ? "text-primary" : "text-muted-foreground")} />
  <a className={cn(buttonVariants({ size: "lg" }), "w-full rounded-full")} href={href} />
  ```

- **`&&` only with a boolean.** `{count && <Badge />}` renders `0` when the count is zero. Use a ternary, or compare first in the hook.
- **Never define a component inside another component.** It remounts on every render and loses its state.
- **A large conditional sub-tree becomes its own component**, in its own file.
- **No JSX and no class-name strings in constants.** Static markup stays inline where it renders; markup used in several places becomes a component.
- **Choose between variants with a lookup map**, never a chain of conditions. Map to components at module level:

  ```tsx
  const STEP_VIEWS = {
    email: EmailStep,
    password: PasswordStep,
  } satisfies Record<SignInStep, ComponentType<StepViewProps>>;

  export const SignInSteps = ({ step, ...props }: SignInStepsProps) => {
    const StepView = STEP_VIEWS[step];

    return <StepView {...props} />;
  };
  ```

  When the renderers need values from props or state and cannot take them as props, the map may be built with `useMemo` inside the component. That is the only `useMemo` a component file holds.

## Props

- **Props extend the props of the root element**, so callers can pass any native attribute: `ComponentProps<"div">` for an HTML element, `ComponentProps<typeof Button>` for a wrapped component. Add the component's own props with `&`, and use `Omit` for an inherited prop whose meaning changes. `HomeActions`, this repository's own component, is the whole shape:

  ```tsx
  // _pages/home/ui/HomeActions.tsx
  type HomeActionsProps = ComponentProps<"div">;

  export const HomeActions = ({ className, ...props }: HomeActionsProps) => (
    <div className={cn("flex w-full flex-col gap-4 sm:w-auto sm:flex-row", className)} {...props}>
      …
    </div>
  );
  ```

- **The rest is called `props` and is spread on the root element** (`...props`, never `...rest`).
- **`className` is composed, never replaced**: `cn("base classes", className)`.
- **Order: `className` first, then data, then callbacks**, in the props type, in the destructuring, when passing props in JSX and in what a hook returns. Inside a group the fields are alphabetical everywhere except the JSX, where an attribute list reads better grouped than sorted. The linter fixes all four; the kit's generated components keep the order the shadcn CLI wrote.
- **Each component declares its own `XProps`**, next to it, unexported. Another component that needs the same shape derives it: `ComponentProps<typeof LoginForm>`. What gets shared between components is a callback type, not a props type.
- **A closed component is the exception.** A component that takes full control of its root, renames or wraps the root's props and forwards nothing (a dialog that owns its open state and close behavior, for example) does not extend `ComponentProps`. A presentational wrapper around an element is never closed.
- **What the router renders has no caller to extend.** A route file's component and the page component a route file re-exports are called by React with what Next.js hands them: a layout gets `children` and `params`, a page gets `params` and `searchParams`, and the last three are promises. They type that with `LayoutProps<"/">` or `PageProps<"/products/[id]">`, read the fields they need, and spread nothing — forwarding what they were given onto an element puts `params="[object Promise]"` in the DOM. Everything below them is a normal component and extends its root.
- **A provider in `_app/providers` takes `children`.** Its root is whichever provider it wires, and that root changes the day a second one is added, so extending the root's props would tie the app's provider stack to the library that happens to be outermost today.
- **No boolean props that switch behavior** (`isEditing`, `isThread`). Build explicit variants through [composition](#composition). A visual variant is a single union prop (`variant: "default" | "outline"`), declared with `cva` next to the component, the way the UI kit does it.
- **The UI kit first.** When the kit (`@repo/ui`) has a component for an element, use it: `Button` over `<button>`, `Input` over `<input>`, and the same for `select`, `textarea`, `label` and `dialog`. Semantic containers (`div`, `section`, `nav`, `ul`, headings) have no kit equivalent and are used directly. A missing component is added to the kit, not written inline.

## Hooks

A hook holds a component's logic: state, derived values and handlers.

```ts
// _pages/login/model/use-login-form.ts
import type { ChangeEvent, SubmitEvent } from "react";
import { useCallback, useState } from "react";

import type { LoginError } from "../config/login-errors";
import { LOGIN_ERROR_MESSAGES } from "../config/login-errors";
import { validateEmail } from "../lib/validate-email";

type UseLoginFormOptions = {
  onSubmit: (email: string) => void;
};

export const useLoginForm = ({ onSubmit }: UseLoginFormOptions) => {
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<LoginError | null>(null);

  const errorMessage = error ? LOGIN_ERROR_MESSAGES[error] : null;
  const isSubmitDisabled = email === "";

  const handleEmailChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  }, []);

  const handleSubmit = useCallback(
    (event: SubmitEvent<HTMLFormElement>) => {
      event.preventDefault();

      const validationError = validateEmail(email);

      if (validationError) return setError(validationError);

      onSubmit(email);
    },
    [email, onSubmit],
  );

  return { email, errorMessage, isSubmitDisabled, handleEmailChange, handleSubmit };
};
```

- **Where it lives**: a component's hook goes in the slice's `model/` segment as `use-<name>.ts`; a hook that fetches or mutates data goes in `api/`. The file holds the hook and its `Use<Name>Options` type, nothing else. Pure helpers go to `lib/`, named data to `config/`, shared types to `model/<domain>.ts`.
- **It returns a plain object**, even with one field, and the object itself is not wrapped in `useMemo`. The exception is a hook that only subscribes and cleans up (an event listener), which may return nothing.
- **No return type annotation.** Let TypeScript infer it.
- **Order inside the hook**: other hooks first (custom hooks, router, refs), then `useState`, then `useMemo`, then `useCallback`, and `useEffect` last.
- **Order of fields**: values first and functions last, alphabetical within each group, in the options type, in the returned object and in the consumer's destructuring.
- **`useState` is always typed**: `useState<string>("")`, `useState<Product | null>(null)`.
- **`useEffect` only wires.** It subscribes and unsubscribes, calls a callback and cleans up. Anything longer (a request, a `try`/`catch`, a transformation) is a `useCallback` declared above the effect and listed in its dependencies.
- **Most logic does not need an effect at all.** Derive values during render instead of copying them into state from an effect, and run the response to a user action in its event handler, not in an effect that watches for its result.
- **Global side effects split into a headless hook and a provider.** The hook exposes state and memoized callbacks and contains no effect; a provider in `_app/providers` calls it and wires the effect:

  ```tsx
  export const OnlineStatusProvider = ({ children }: OnlineStatusProviderProps) => {
    const { isOnline, handleOffline, handleOnline } = useOnlineStatus();

    useEffect(() => {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, [handleOffline, handleOnline]);

    return <OnlineStatusContext value={isOnline}>{children}</OnlineStatusContext>;
  };
  ```

  A parent never calls a hook only to ignore what it returns.

## State and memoization

- **Derive, do not store.** A value computable from props or state is computed during render, not kept in state and synced by an effect.
- **Functional updates** when the next state depends on the previous one: `setCount((previous) => previous + 1)`.
- **Lazy initial state** for an expensive first value: `useState<Filters>(() => readFilters(searchParams))`.
- **Refs for values that change often but do not render**, such as the latest pointer position during a drag.
- **Non-urgent updates in a transition** (`startTransition`, `useDeferredValue`) so typing stays responsive.
- **What to memoize:**
  - an object, array or function that is passed to a child or used as a dependency: `useMemo` or `useCallback`, in the hook;
  - an expensive computation: `useMemo`, in the hook;
  - a simple expression with a primitive result (`email === ""`, `a || b`): never. Comparing the dependencies costs more than the expression.
- **A `style` object is an object like any other**: built from values it is a `useMemo` in the hook, fixed it is a module-level constant. Written in the prop it is a new object on every render, which is why the linter reports it there.
- **`useMemo` takes no type argument.** What the factory returns already fixes the type; `useState` is typed instead because its initial value seldom is enough to fix one. A memo whose type inference genuinely cannot reach is an override in the ESLint config, with the reason beside it.
- **The logic inside `useMemo` lives in `lib/`.** The hook only memoizes: `useMemo(() => buildRows(items, columns), [items, columns])`. The same goes for view models, per-item styles and per-item handlers: a builder in `lib/` produces them, the hook memoizes them, and the JSX only reads them.
- **`React.memo` only with a measured reason.** Every `memo()` is reported, so taking one costs a block in the ESLint config; the measurement is what goes next to it.
- If the React Compiler is enabled later, manual `useMemo` and `useCallback` become optional; keep the existing ones.

## Composition

- **Compound components for anything complex.** Share state through a context and expose the parts: `<Composer.Frame>`, `<Composer.Input>`, `<Composer.Submit>`. Callers assemble what they need instead of toggling flags.
- **Explicit variants instead of modes.** `<ThreadComposer />` and `<EditMessageComposer />` each compose the parts they use; one `<Composer isThread isEditing />` hides every combination behind conditionals.
- **`children` over render props** for composition. A render prop is for passing data back to the caller.
- **The provider is the only place that knows how state is stored.** Its context value has a small interface (state, actions, metadata) that the parts consume, so the storage can change without touching them. Lift state into the provider when siblings need it.
- **React 19 APIs:**
  - `ref` is a regular prop; do not use `forwardRef`;
  - read a context with `use(Context)`, not `useContext`;
  - render `<Context value={...}>`, not `<Context.Provider>`.

## Data fetching and performance

- **No waterfalls.** Start independent requests together with `Promise.all`; start a request early and `await` it where the value is needed; check cheap synchronous conditions before awaiting anything.
- **Fetch on the server, in the slice.** A Server Component calls a request function from its slice's `api/` segment. Wrap a request that several components of one render need in `React.cache` so it runs once per request.
- **Stream what is slow.** Wrap a slow part in `<Suspense>` with a fallback so the rest of the page is sent first.
- **Work that the response does not need runs after it**, with `after()` (logging, analytics).
- **No mutable module-level state on the server.** A module variable is shared by every request.
- **Server Actions are public endpoints.** Each one lives in an `api/` file that starts with `"use server"`, and each one validates its input and checks authentication and authorization itself, however the page that calls it is protected.
- **When a Client Component has to fetch, it goes through a caching library** (SWR or TanStack Query), never through `useEffect`. The library deduplicates requests and handles loading and errors; its hooks live in the slice's `api/` segment.
- **Keep the client bundle small.** Load heavy client-only components with `next/dynamic`, load third-party scripts after hydration with `next/script`, and import only the modules you use. Next.js rewrites imports from well-known libraries with huge entry points (icon sets, component kits); add any other such library to `optimizePackageImports` in `next.config.ts`. A slice's `index.ts` is a short, explicit public API, not one of those entry points.
- **Rendering:** `content-visibility: auto` on long lists, `<Activity>` to hide a subtree while keeping its state, and React DOM resource hints (`preload`, `preconnect`) for resources the next interaction needs.

## Next.js specifics

- **Route files only re-export** from `@/_pages/*` and `@/_app/*`; see the [FSD guide](../architecture/feature-sliced-design.md#route-files-stay-thin). Route segment config (`dynamic`, `revalidate`, `runtime`...) is the exception and is written in the route file itself.
- **Page components type their props** with the generated helpers: `PageProps<"/products/[id]">`, `LayoutProps<"/">`. `params` and `searchParams` are promises.
- **Metadata** comes from `metadata` or `generateMetadata`, exported by the page slice and re-exported by the route file.
- **Framework components over raw elements**: `next/image` for images, `next/link` for internal links, `next/font` for fonts (defined in `_app/fonts`), `next/script` for third-party scripts.

## Styling

Tailwind CSS v4 reads its theme from [`@repo/tailwind-config`](../../tooling/tailwind/README.md), and the UI kit is [`@repo/ui`](../../packages/ui/README.md). [DESIGN.md](../../DESIGN.md) lists the tokens.

- **Only values from the theme.** No arbitrary values: `w-[123px]`, `text-[14px]`, `bg-[#1a2b3c]`, `z-[60]`, `shadow-[...]` and `rounded-[...]` are all out. Use the closest step of the scale; a value the design needs and the scale lacks becomes a named token in the theme, and the code uses its class.
- **Colors come from semantic tokens** (`bg-primary`, `text-muted-foreground`, `border-border`), never from hex values.
- **One exception**: a computed value with no scale equivalent, used once (`h-[calc(100dvh-4rem)]`). Used twice, it becomes a token.
- **Classes live inline in `className`**, composed with `cn()`. A component's variant table built with `cva` lives next to that component.

## Accessibility

- Use the element that has the semantics: `<button>` (or the kit's `Button`) for actions, `<a>`/`<Link>` for navigation, headings in order, lists as lists.
- Every image has an `alt`, empty only when it is decorative. Every form control has a label.
- Everything that responds to a click responds to the keyboard, and focus stays visible.
- ARIA attributes only when no native element provides the semantics.
- Review UI changes with the `web-design-guidelines` agent skill, vendored in `.claude/skills/`.

## Enforcement

In addition to the checks in [code-style.md](code-style.md#enforcement):

| Rule                                                                                                    | Check                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Rules of hooks, no components created during render, no synchronous `setState` in effects, purity, refs | `eslint-plugin-react-hooks` (`recommended-latest`)                                                                                         |
| Missing effect dependencies (warning)                                                                   | `react-hooks/exhaustive-deps`                                                                                                              |
| No state or effect hooks in slice `ui/` files                                                           | `no-restricted-syntax` (hook calls in `src/{_pages,widgets,features,entities}/**/ui/**/*.tsx`)                                             |
| No `if` in a component body except navigation guards                                                    | `no-restricted-syntax` (for `*.tsx`)                                                                                                       |
| No computation in JSX props: arithmetic, comparisons and `??`                                           | `no-restricted-syntax` (for `*.tsx`)                                                                                                       |
| No computation in JSX props: objects, arrays, ternaries, template literals, `&&`, `\|\|`, array methods | `no-restricted-syntax` (for the app's own `.tsx` in `app/` and `src/`; what the prop receives, so a call keeps its arguments out of reach) |
| No JSX stored in a constant                                                                             | `no-restricted-syntax` (`VariableDeclarator > JSXElement`, `JSXFragment`)                                                                  |
| A props type is never exported                                                                          | `no-restricted-syntax` (for the app's own `.tsx`, both export forms)                                                                       |
| The rest of the props is named `props`                                                                  | `no-restricted-syntax` (for `*.tsx`)                                                                                                       |
| `useState` typed, hooks without a return type, `useMemo` without a type argument                        | `no-restricted-syntax`                                                                                                                     |
| A hook returns a plain object, never one wrapped in `useMemo`                                           | `no-restricted-syntax`                                                                                                                     |
| No `React.memo` without a measured reason                                                               | `no-restricted-syntax`                                                                                                                     |
| `className` first and callbacks last in JSX                                                             | `perfectionist/sort-jsx-props`                                                                                                             |
| `className` first and callbacks last in the props type, the destructuring and a hook's return           | `perfectionist/sort-object-types`, `perfectionist/sort-objects` (switched off for the kit's generated components)                          |
| Alphabetical inside each group, except in the JSX and in data written in a chosen order                 | the same two rules, `alphabetical` for types, destructuring and hook files, `unsorted` for the rest                                        |
| `&&` only with a boolean                                                                                | `@eslint-react/no-leaked-conditional-rendering`                                                                                            |
| No component defined inside another                                                                     | `@eslint-react/no-nested-component-definitions`, `react-hooks/static-components`                                                           |
| No index as `key`                                                                                       | `@eslint-react/no-array-index-key`                                                                                                         |
| No `forwardRef`, `use` over `useContext`, `<Context>` over `<Context.Provider>`                         | `@eslint-react/no-forward-ref`, `@eslint-react/no-use-context`, `@eslint-react/no-context-provider`                                        |
| Stable context values and default props                                                                 | `@eslint-react/no-unstable-context-value`, `@eslint-react/no-unstable-default-props`                                                       |
| `[value, setValue]` naming for state                                                                    | `@eslint-react/use-state`                                                                                                                  |
| Next.js rules (`next/image`, scripts, fonts)                                                            | `@next/eslint-plugin-next` (`core-web-vitals`)                                                                                             |
| Accessibility                                                                                           | `eslint-plugin-jsx-a11y` (`recommended`)                                                                                                   |
| The UI kit first (`button`, `input`, `select`, `textarea`, `label`, `dialog`)                           | `no-restricted-syntax` (for the app's own `.tsx`)                                                                                          |
| No arbitrary values (`calc()` allowed)                                                                  | `better-tailwindcss/no-restricted-classes`                                                                                                 |
| Only classes the theme defines                                                                          | `better-tailwindcss/no-unknown-classes`                                                                                                    |
| Canonical and current Tailwind v4 classes, `(--var)` syntax, no conflicting classes                     | `better-tailwindcss/enforce-canonical-classes`, `enforce-consistent-variable-syntax`, `no-deprecated-classes`, `no-conflicting-classes`    |
