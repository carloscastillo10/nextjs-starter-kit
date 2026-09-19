# 🧩 @repo/ui

> The shadcn/ui components every app shares, built on Base UI and styled with the shared design tokens.

![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-base--nova-000000?logo=shadcnui&logoColor=white)
![Base UI](https://img.shields.io/badge/Base_UI-v1-000000)
![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

## 🎯 Purpose

The UI kit of the monorepo. Apps render `Button` instead of a raw `<button>`, and the same goes for every primitive added here: the code standard asks for the kit first, and ESLint reports raw `button`, `input`, `select`, `textarea`, `label` and `dialog` elements in app code. The components come from the shadcn CLI, so they are source files in this package that you own and can change.

The package holds only primitives with no knowledge of any app. Colors, radius and fonts come from [`@repo/tailwind-config`](../../tooling/tailwind/README.md).

## 🗂️ Structure

| Path                                                       | Export                       | Holds                                                                 |
| ---------------------------------------------------------- | ---------------------------- | --------------------------------------------------------------------- |
| [`src/components/button.tsx`](./src/components/button.tsx) | `@repo/ui/components/button` | `Button` and `buttonVariants`                                         |
| [`src/lib/utils.ts`](./src/lib/utils.ts)                   | `@repo/ui/lib/utils`         | `cn`, which joins class names and resolves conflicts between them     |
| [`src/styles/globals.css`](./src/styles/globals.css)       | `@repo/ui/globals.css`       | The kit's files, registered with Tailwind so their classes are built  |
| `src/hooks/`                                               | `@repo/ui/hooks/<name>`      | Hooks the CLI adds with some components (created on first use)        |
| [`components.json`](./components.json)                     | none                         | shadcn CLI config: Base UI (`base-nova`), Lucide icons, shared tokens |

`Button` variants: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.

## 🚀 Usage

```tsx
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import type { ComponentProps } from "react";

export const SaveButton = ({ className, ...props }: ComponentProps<typeof Button>) => (
  <Button className={cn("w-full", className)} variant="outline" {...props} />
);
```

An app depends on `@repo/ui`, lists it in `transpilePackages` in `next.config.ts`, and imports the kit's stylesheet after the shared theme:

```css
@import "@repo/tailwind-config/theme.css";
@import "@repo/ui/globals.css";
```

> [!IMPORTANT]
> **For navigation, style a link; do not turn a button into one.** Base UI's `render` prop keeps the button
> semantics of the component it replaces, so `<Button render={<Link />} nativeButton={false}>` produces
> `<a role="button">`: a screen reader announces a button, and the browser behaviors of a link go with it. Apply the
> variants to the link instead:
>
> ```tsx
> import { buttonVariants } from "@repo/ui/components/button";
> import Link from "next/link";
>
> <Link className={buttonVariants({ variant: "outline" })} href="/docs">
>   Docs
> </Link>;
> ```
>
> `render` is the right tool when the element really is a button and only the tag changes. There is no
> `asChild` in Base UI.

## ⌨️ Commands

| Command                                                        | What it does                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `cd apps/web && pnpm dlx shadcn@latest add <component>`        | Add a component: it lands in `src/components/`, its CSS variables in the shared theme |
| `cd apps/web && pnpm dlx shadcn@latest add <component> --diff` | Compare a component with the current upstream version                                 |
| `pnpm --filter @repo/ui test`                                  | Vitest, in the `node` environment                                                     |
| `pnpm --filter @repo/ui lint`                                  | ESLint                                                                                |
| `pnpm --filter @repo/ui types:check`                           | TypeScript                                                                            |

## 🔁 How it updates

Components are copied, not installed, so they change only when you run the CLI. Before taking an upstream change, run `add <component> --diff` from `apps/web` and merge by hand what you want to keep. Dependencies of the components (Base UI, `class-variance-authority`, Lucide) are versioned in the `catalog` of `pnpm-workspace.yaml`.

## 🧩 Extending

The Vitest config of this package merges the `base` preset, which runs in Node. A test that renders a
component needs the `react` preset of [`@repo/vitest-config`](../../tooling/vitest/README.md) and the
`jsdom`, `@testing-library/react` and `@testing-library/dom` devDependencies the preset expects; without them
the first render fails on a missing `document`.

After `shadcn add`, bring the new file in line with the code standard before committing:

1. `pnpm format:fix` and `pnpm lint:fix` from the repository root: Prettier sorts the classes with the shared theme, ESLint fixes import and prop order.
2. Rewrite each `function Name() {}` the CLI generated as `const Name = () => ...`; ESLint reports them (`func-style`) and cannot fix them itself.
3. If the CLI added a dependency with a version, move the version to the `catalog` and write `catalog:` in `package.json`.

- **A new variant** goes in the component's `cva` table, next to the others.
- **Icons** come from `lucide-react`, the icon library in `components.json`.
- **Toasts**: with Base UI, add the `toast` component, not Sonner.
- **App-specific compositions** (a branded header, a form) do not belong here; they go in the app, in `src/shared/ui` or the page that uses them.

## 🔗 Related

- [@repo/tailwind-config](../../tooling/tailwind/README.md): the tokens these components use
- [DESIGN.md](../../DESIGN.md): the design system, value by value
- [React conventions](../../docs/conventions/react.md): the UI kit first, props and styling rules
- [shadcn/ui monorepo docs](https://ui.shadcn.com/docs/monorepo): how the CLI writes into a package
