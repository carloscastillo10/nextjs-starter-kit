---
tags: [design-system, design-tokens, tailwind, shadcn]
aliases: [Design system, Design tokens, DESIGN]
version: alpha
name: nextjs-starter-kit
description: The neutral shadcn/ui base theme (base-nova on Base UI), in light and dark, for the product built on this template to rebrand.
colors:
  background: "oklch(1 0 0)"
  foreground: "oklch(0.145 0 0)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.145 0 0)"
  popover: "oklch(1 0 0)"
  popover-foreground: "oklch(0.145 0 0)"
  primary: "oklch(0.205 0 0)"
  primary-foreground: "oklch(0.985 0 0)"
  secondary: "oklch(0.97 0 0)"
  secondary-foreground: "oklch(0.205 0 0)"
  muted: "oklch(0.97 0 0)"
  muted-foreground: "oklch(0.54 0 0)"
  accent: "oklch(0.97 0 0)"
  accent-foreground: "oklch(0.205 0 0)"
  destructive: "oklch(0.577 0.245 27.325)"
  border: "oklch(0.922 0 0)"
  input: "oklch(0.922 0 0)"
  ring: "oklch(0.708 0 0)"
  chart-1: "oklch(0.87 0 0)"
  chart-2: "oklch(0.556 0 0)"
  chart-3: "oklch(0.439 0 0)"
  chart-4: "oklch(0.371 0 0)"
  chart-5: "oklch(0.269 0 0)"
  sidebar: "oklch(0.985 0 0)"
  sidebar-foreground: "oklch(0.145 0 0)"
  sidebar-primary: "oklch(0.205 0 0)"
  sidebar-primary-foreground: "oklch(0.985 0 0)"
  sidebar-accent: "oklch(0.97 0 0)"
  sidebar-accent-foreground: "oklch(0.205 0 0)"
  sidebar-border: "oklch(0.922 0 0)"
  sidebar-ring: "oklch(0.708 0 0)"
  background-dark: "oklch(0.145 0 0)"
  foreground-dark: "oklch(0.985 0 0)"
  card-dark: "oklch(0.205 0 0)"
  card-foreground-dark: "oklch(0.985 0 0)"
  popover-dark: "oklch(0.205 0 0)"
  popover-foreground-dark: "oklch(0.985 0 0)"
  primary-dark: "oklch(0.922 0 0)"
  primary-foreground-dark: "oklch(0.205 0 0)"
  secondary-dark: "oklch(0.269 0 0)"
  secondary-foreground-dark: "oklch(0.985 0 0)"
  muted-dark: "oklch(0.269 0 0)"
  muted-foreground-dark: "oklch(0.708 0 0)"
  accent-dark: "oklch(0.269 0 0)"
  accent-foreground-dark: "oklch(0.985 0 0)"
  destructive-dark: "oklch(0.704 0.191 22.216)"
  border-dark: "oklch(1 0 0 / 10%)"
  input-dark: "oklch(1 0 0 / 15%)"
  ring-dark: "oklch(0.556 0 0)"
  chart-1-dark: "oklch(0.87 0 0)"
  chart-2-dark: "oklch(0.556 0 0)"
  chart-3-dark: "oklch(0.439 0 0)"
  chart-4-dark: "oklch(0.371 0 0)"
  chart-5-dark: "oklch(0.269 0 0)"
  sidebar-dark: "oklch(0.205 0 0)"
  sidebar-foreground-dark: "oklch(0.985 0 0)"
  sidebar-primary-dark: "oklch(0.488 0.243 264.376)"
  sidebar-primary-foreground-dark: "oklch(0.985 0 0)"
  sidebar-accent-dark: "oklch(0.269 0 0)"
  sidebar-accent-foreground-dark: "oklch(0.985 0 0)"
  sidebar-border-dark: "oklch(1 0 0 / 10%)"
  sidebar-ring-dark: "oklch(0.556 0 0)"
typography:
  headline-lg:
    fontFamily: Geist
    fontSize: 1.875rem
    fontWeight: 600
    lineHeight: 2.25rem
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 2rem
  headline-sm:
    fontFamily: Geist
    fontSize: 1.25rem
    fontWeight: 600
    lineHeight: 1.75rem
  body-md:
    fontFamily: Geist
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.25rem
  label-md:
    fontFamily: Geist
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Geist
    fontSize: 0.75rem
    fontWeight: 500
    lineHeight: 1rem
rounded:
  sm: 0.375rem
  md: 0.5rem
  lg: 0.625rem
  xl: 0.875rem
  2xl: 1.125rem
  3xl: 1.375rem
  4xl: 1.625rem
  full: 9999px
spacing:
  base: 0.25rem
  "1": 0.25rem
  "2": 0.5rem
  "3": 0.75rem
  "4": 1rem
  "6": 1.5rem
  "8": 2rem
  "12": 3rem
  "16": 4rem
components:
  button-default:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.label-md}"
    rounded: "{rounded.lg}"
    height: 2rem
    padding: 0.625rem
  button-default-dark:
    backgroundColor: "{colors.primary-dark}"
    textColor: "{colors.primary-foreground-dark}"
  button-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.secondary-foreground}"
  button-secondary-dark:
    backgroundColor: "{colors.secondary-dark}"
    textColor: "{colors.secondary-foreground-dark}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
  button-outline-dark:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.foreground-dark}"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-ghost-hover-dark:
    backgroundColor: "{colors.muted-dark}"
    textColor: "{colors.foreground-dark}"
  button-destructive:
    backgroundColor: "{colors.background}"
    textColor: "{colors.destructive}"
  button-destructive-dark:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.destructive-dark}"
  button-link:
    backgroundColor: "{colors.background}"
    textColor: "{colors.primary}"
  button-link-dark:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.primary-dark}"
  surface-page:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-md}"
  surface-page-dark:
    backgroundColor: "{colors.background-dark}"
    textColor: "{colors.foreground-dark}"
  surface-card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
  surface-card-dark:
    backgroundColor: "{colors.card-dark}"
    textColor: "{colors.card-foreground-dark}"
  surface-popover:
    backgroundColor: "{colors.popover}"
    textColor: "{colors.popover-foreground}"
  surface-popover-dark:
    backgroundColor: "{colors.popover-dark}"
    textColor: "{colors.popover-foreground-dark}"
  surface-muted:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
  surface-muted-dark:
    backgroundColor: "{colors.muted-dark}"
    textColor: "{colors.muted-foreground-dark}"
  surface-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-foreground}"
  surface-accent-dark:
    backgroundColor: "{colors.accent-dark}"
    textColor: "{colors.accent-foreground-dark}"
  surface-sidebar:
    backgroundColor: "{colors.sidebar}"
    textColor: "{colors.sidebar-foreground}"
  surface-sidebar-dark:
    backgroundColor: "{colors.sidebar-dark}"
    textColor: "{colors.sidebar-foreground-dark}"
  surface-sidebar-primary:
    backgroundColor: "{colors.sidebar-primary}"
    textColor: "{colors.sidebar-primary-foreground}"
  surface-sidebar-primary-dark:
    backgroundColor: "{colors.sidebar-primary-dark}"
    textColor: "{colors.sidebar-primary-foreground-dark}"
  surface-sidebar-accent:
    backgroundColor: "{colors.sidebar-accent}"
    textColor: "{colors.sidebar-accent-foreground}"
  surface-sidebar-accent-dark:
    backgroundColor: "{colors.sidebar-accent-dark}"
    textColor: "{colors.sidebar-accent-foreground-dark}"
---

# 🎨 Design system

> The visual language of nextjs-starter-kit: the neutral shadcn/ui theme, its tokens in light and dark, and the rules for using them.

![DESIGN.md spec alpha](https://img.shields.io/badge/DESIGN.md-alpha-4285F4?logo=google&logoColor=white)
![shadcn/ui base-nova](https://img.shields.io/badge/shadcn%2Fui-base--nova-000000?logo=shadcnui&logoColor=white)
![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

This file follows the [DESIGN.md format](https://github.com/google-labs-code/design.md): the front matter holds the tokens, and the sections below explain when to use them. It describes [`tooling/tailwind/theme.css`](./tooling/tailwind/theme.css), which is where the values live. Change the two together.

## Overview

The template ships a deliberately plain theme: the shadcn/ui `base-nova` style on Base UI components, the `neutral` base color, Geist, and a light and a dark mode that follow the system setting. It carries no brand. A product built on the template replaces the values and keeps the names, so every component keeps working.

| What                          | Where                                                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Token values and base styles  | [`tooling/tailwind/theme.css`](./tooling/tailwind/theme.css) (`@repo/tailwind-config`)                                |
| Components                    | [`packages/ui`](./packages/ui/README.md) (`@repo/ui`)                                                                 |
| Font                          | [`apps/web/src/_app/fonts/sans.ts`](./apps/web/src/_app/fonts/sans.ts) (`next/font`)                                  |
| Theme switching (light, dark) | [`apps/web/src/_app/providers/Providers.tsx`](./apps/web/src/_app/providers/Providers.tsx) (`next-themes`)            |
| Browser toolbar color         | [`apps/web/app/layout.tsx`](./apps/web/app/layout.tsx), whose `themeColor` repeats `background` and `background-dark` |

## Colors

Every color is a CSS variable in OKLCH, set in `:root` for light mode and in `.dark` for dark mode. Tailwind maps each one to utilities through `@theme inline`: `--primary` becomes `bg-primary`, `text-primary`, `border-primary`, with opacity modifiers such as `bg-primary/80`. In the front matter, a dark value carries the `-dark` suffix: `primary-dark` is the value of `--primary` inside `.dark`.

Colors come in pairs. The base name is a surface, and `-foreground` is the text and icon color on that surface.

| Token pair                           | Light                                   | Dark                                       | Use                                                       |
| ------------------------------------ | --------------------------------------- | ------------------------------------------ | --------------------------------------------------------- |
| `background` / `foreground`          | `oklch(1 0 0)` / `oklch(0.145 0 0)`     | `oklch(0.145 0 0)` / `oklch(0.985 0 0)`    | The page and its text                                     |
| `card` / `card-foreground`           | `oklch(1 0 0)` / `oklch(0.145 0 0)`     | `oklch(0.205 0 0)` / `oklch(0.985 0 0)`    | Grouped content on the page                               |
| `popover` / `popover-foreground`     | `oklch(1 0 0)` / `oklch(0.145 0 0)`     | `oklch(0.205 0 0)` / `oklch(0.985 0 0)`    | Menus, popovers, dialogs                                  |
| `primary` / `primary-foreground`     | `oklch(0.205 0 0)` / `oklch(0.985 0 0)` | `oklch(0.922 0 0)` / `oklch(0.205 0 0)`    | The main action of a view                                 |
| `secondary` / `secondary-foreground` | `oklch(0.97 0 0)` / `oklch(0.205 0 0)`  | `oklch(0.269 0 0)` / `oklch(0.985 0 0)`    | Actions next to the main one                              |
| `muted` / `muted-foreground`         | `oklch(0.97 0 0)` / `oklch(0.54 0 0)`   | `oklch(0.269 0 0)` / `oklch(0.708 0 0)`    | Quiet surfaces; secondary text such as hints and captions |
| `accent` / `accent-foreground`       | `oklch(0.97 0 0)` / `oklch(0.205 0 0)`  | `oklch(0.269 0 0)` / `oklch(0.985 0 0)`    | Hovered and highlighted items                             |
| `destructive`                        | `oklch(0.577 0.245 27.325)`             | `oklch(0.704 0.191 22.216)`                | Errors and actions that delete or cannot be undone        |
| `border`, `input`                    | `oklch(0.922 0 0)`                      | `oklch(1 0 0 / 10%)`, `oklch(1 0 0 / 15%)` | Dividers and outlines; form control borders               |
| `ring`                               | `oklch(0.708 0 0)`                      | `oklch(0.556 0 0)`                         | Focus rings                                               |
| `chart-1` to `chart-5`               | `oklch(0.87 0 0)` to `oklch(0.269 0 0)` | same as light                              | Data series, from lightest to darkest                     |
| `sidebar` and `sidebar-*`            | see front matter                        | see front matter                           | An app sidebar, which keeps its own surface and accents   |

Dark mode is a `dark` class on `<html>`. `next-themes` sets it from the system preference before the page paints, and sets `color-scheme` to match, so native controls and scrollbars follow. The app also declares `<meta name="color-scheme" content="light dark">`. Components never branch on the mode: the variables change, and `dark:` is left for the rare case a variable cannot cover.

> [!NOTE]
> Every text pair meets WCAG AA (4.5:1) in both modes. The tightest is `muted-foreground`, secondary text that sits on `muted`, `background` and `card`: 4.61:1 on `muted` and 5.02:1 on `background` in light mode, 5.86:1 on `muted` in dark mode. It is one step darker than shadcn's neutral preset (`oklch(0.556 0 0)`, 4.35:1 on `muted`) for that reason. Check these pairs again when you rebrand.

## Typography

One family, Geist, loaded with `next/font` into `--font-sans` and applied to `<html>` by the base styles. `font-heading` points at the same family, so a brand can give headings their own font by changing one variable. Monospace text uses Tailwind's default monospace stack.

The type scale is Tailwind's default, which the theme does not override:

| Token         | Classes                  | Size / line height | Weight |
| ------------- | ------------------------ | ------------------ | ------ |
| `headline-lg` | `text-3xl font-semibold` | 1.875rem / 2.25rem | 600    |
| `headline-md` | `text-2xl font-semibold` | 1.5rem / 2rem      | 600    |
| `headline-sm` | `text-xl font-semibold`  | 1.25rem / 1.75rem  | 600    |
| `body-md`     | `text-base`              | 1rem / 1.5rem      | 400    |
| `body-sm`     | `text-sm`                | 0.875rem / 1.25rem | 400    |
| `label-md`    | `text-sm font-medium`    | 0.875rem / 1.25rem | 500    |
| `label-sm`    | `text-xs font-medium`    | 0.75rem / 1rem     | 500    |

Weight and size carry the hierarchy. Two weights per view are usually enough.

## Layout

Spacing is Tailwind's scale on a `0.25rem` base (`--spacing`): `p-1` is 0.25rem, `p-4` is 1rem, `gap-6` is 1.5rem. The front matter lists the steps in common use; every step in between exists too. Layout uses flex and grid with `gap-*`, not `space-x-*` or `space-y-*`, and `size-*` when width and height match. A full-height view uses `min-h-dvh`.

Breakpoints are Tailwind's defaults: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem. Styles are written for the smallest screen first.

## Elevation & Depth

The theme is flat. Hierarchy comes from tonal surfaces (`card` and `popover` on `background`, which differ in dark mode), from `border` lines, and from spacing. Shadows are Tailwind's defaults and are left to floating layers such as menus and popovers. Focus is a 3px `ring` at 50% opacity (`focus-visible:ring-3 focus-visible:ring-ring/50`), never removed without a replacement.

## Shapes

Corners derive from one variable, `--radius: 0.625rem`. The scale multiplies it, so changing `--radius` reshapes every component at once:

| Token  | Class          | CSS variable   | Value                        |
| ------ | -------------- | -------------- | ---------------------------- |
| `sm`   | `rounded-sm`   | `--radius-sm`  | `--radius` × 0.6 = 0.375rem  |
| `md`   | `rounded-md`   | `--radius-md`  | `--radius` × 0.8 = 0.5rem    |
| `lg`   | `rounded-lg`   | `--radius-lg`  | `--radius` = 0.625rem        |
| `xl`   | `rounded-xl`   | `--radius-xl`  | `--radius` × 1.4 = 0.875rem  |
| `2xl`  | `rounded-2xl`  | `--radius-2xl` | `--radius` × 1.8 = 1.125rem  |
| `3xl`  | `rounded-3xl`  | `--radius-3xl` | `--radius` × 2.2 = 1.375rem  |
| `4xl`  | `rounded-4xl`  | `--radius-4xl` | `--radius` × 2.6 = 1.625rem  |
| `full` | `rounded-full` | Tailwind       | fully round (pills, avatars) |

Buttons use `lg`. Larger surfaces use a larger step than the controls inside them.

## Components

`@repo/ui` has one component today, `Button`, which is what the app shell needs. More come from the shadcn CLI as the product needs them; see the [kit's README](./packages/ui/README.md).

| Variant       | Look                                         | Use                                         |
| ------------- | -------------------------------------------- | ------------------------------------------- |
| `default`     | `primary` fill, `primary-foreground` text    | The main action; one per view               |
| `secondary`   | `secondary` fill                             | Actions next to the main one                |
| `outline`     | `border` outline on `background`             | Neutral actions in toolbars and forms       |
| `ghost`       | No fill; `muted` on hover                    | Actions inside dense UI, such as table rows |
| `destructive` | `destructive` text on a 10% (dark: 20%) tint | Deleting or discarding                      |
| `link`        | `primary` text, underlined on hover          | An action that reads as a link              |

Sizes are `xs` (1.5rem), `sm` (1.75rem), `default` (2rem), `lg` (2.25rem), and square `icon` sizes to match. The `button-*` entries in the front matter record each variant's colors; the `surface-*` entries record the surface pairs above, so the linter checks the contrast of each one in both modes.

## Do's and Don'ts

- **Do** use the semantic utilities (`bg-primary`, `text-muted-foreground`, `border-border`). **Don't** use palette colors (`bg-blue-500`), hex values or arbitrary values (`w-[123px]`): ESLint rejects arbitrary values and classes the theme does not define in app code. A computed size with `calc()` is the one exception.
- **Do** add a token when the design needs a value the theme lacks: define it in `theme.css`, map it in `@theme inline`, and document it here.
- **Do** use the kit: `Button` from `@repo/ui`, not a raw `<button>`. ESLint reports raw `button`, `input`, `select`, `textarea`, `label` and `dialog` elements in app code.
- **Don't** write `dark:` color overrides. The variables already change with the mode.
- **Do** keep text at 4.5:1 against its surface (3:1 for large text and icons).
- **Don't** set a `z-index` on overlays; the components stack themselves.
- **Do** give an icon-only `Button` (`size="icon"` and its variants) an `aria-label`, and mark its icon `aria-hidden`.

## Changing the brand

1. Pick new values for the color pairs in `:root` and `.dark` of [`theme.css`](./tooling/tailwind/theme.css), or apply a shadcn preset from `apps/web` with `pnpm dlx shadcn@latest apply --only theme <preset>`.
2. Change `--radius` for the corner scale.
3. Change the font in `apps/web/src/_app/fonts/sans.ts`; it keeps the `--font-sans` variable.
4. Copy the new `background` values, light and dark, into `themeColor` in `apps/web/app/layout.tsx`, which colors the browser toolbar.
5. Update the front matter and the tables of this file to the new values.
6. Run `npx -y @google/design.md@0.4.0 lint DESIGN.md` for broken references and contrast, then `pnpm build` and check both modes in the browser.
