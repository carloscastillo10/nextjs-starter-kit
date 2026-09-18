# 🔍 @repo/eslint-config

> ESLint flat config presets that enforce the repository's code standard.

## 🎯 Purpose

One place for every lint rule of the [code conventions](../../docs/conventions/README.md): the TypeScript and React standards, the Feature-Sliced Design limits on route files and slice UI, and the Next.js and accessibility rules. It runs on ESLint 10 with each plugin picked on its own, without `eslint-config-next`.

## 🗂️ Structure

| File        | Export                                                                | For                                                                                                                 |
| ----------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `base.js`   | `base`                                                                | Any TypeScript or JavaScript package                                                                                |
| `react.js`  | `react`                                                               | React libraries: `base` plus React, hooks and accessibility rules                                                   |
| `next.js`   | `next`                                                                | Next.js apps: `react` plus Next.js rules, the Feature-Sliced Design limits, the UI kit first and the Tailwind rules |
| `syntax.js` | `BASE_SYNTAX`, `COMPONENT_SYNTAX`, `SLICE_UI_SYNTAX`, `UI_KIT_SYNTAX` | Selector lists for `no-restricted-syntax`, composed by the presets                                                  |

Each preset is `base`'s rules, its own blocks, and a closing set: JavaScript files without type information, `eslint-config-prettier`, and `curly` after it. Every block has a `name`, so `pnpm exec eslint --inspect-config` shows where a rule comes from.

## 🚀 Usage

```js
// eslint.config.mjs of a Next.js app
import path from "node:path";

import { next } from "@repo/eslint-config/next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  next,
  {
    name: "web/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
  {
    name: "web/tailwind",
    settings: {
      "better-tailwindcss": {
        cwd: import.meta.dirname,
        entryPoint: path.join(import.meta.dirname, "src/_app/styles/globals.css"),
      },
    },
  },
]);
```

Add `@repo/eslint-config` and `eslint` to the package's `devDependencies` and a `lint` script (`eslint .`). Type-aware rules read the package's `tsconfig.json`, so a package with TypeScript needs one.

A Next.js app also sets the `better-tailwindcss` settings above and has `tailwindcss` in its `devDependencies`. The Tailwind rules load Tailwind from `cwd` and read the theme from `entryPoint`, the app's global styles; both are absolute so the result is the same from the app (Turbo) and from the repository root (editor, pre-commit hook). Without them the rules switch themselves off with a warning.

| Rule (`next` preset, `src/**`)                          | Reports                                                                                |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `no-restricted-syntax` (`UI_KIT_SYNTAX`)                | a raw `button`, `input`, `select`, `textarea`, `label` or `dialog`                     |
| `better-tailwindcss/no-restricted-classes`              | an arbitrary value (`w-[123px]`, `bg-[#fff]/50`); `calc()` and arbitrary variants pass |
| `better-tailwindcss/no-unknown-classes`                 | a class the theme does not define, such as `bg-brand` before the token exists          |
| `better-tailwindcss/enforce-canonical-classes`          | a class with a shorter canonical form (`h-4 w-4` is `size-4`)                          |
| `better-tailwindcss/enforce-consistent-variable-syntax` | `bg-[var(--x)]` instead of `bg-(--x)`                                                  |
| `better-tailwindcss/no-deprecated-classes`              | a class Tailwind v4 renamed, such as `flex-grow`                                       |
| `better-tailwindcss/no-conflicting-classes`             | two classes that set the same property, such as `p-2 p-4`                              |

## ⌨️ Commands

| Command                             | What it does                             |
| ----------------------------------- | ---------------------------------------- |
| `pnpm lint`                         | Lint every package and the root files    |
| `pnpm lint:fix`                     | Same, applying the fixes ESLint can make |
| `pnpm exec eslint --inspect-config` | Open the config inspector in a package   |

## 🧩 Extending

- **Change a rule** in the preset block that sets it, and update the Enforcement table of the convention document it belongs to.
- **Relax a rule for some files** with a new block that has `files` and a comment with the reason. Inline directives (`eslint-disable`) are switched off with `noInlineConfig`.
- **Add a `no-restricted-syntax` selector** to a list in `syntax.js`. A block that sets the rule replaces the list of earlier blocks, so each block spreads every list it needs, as the `components` and `slice-ui` blocks do.
- **Another element with a kit component**: add its name to the `UI_KIT_SYNTAX` selector in `syntax.js` once `@repo/ui` has the component.
- **Tailwind rules** are in the `next/tailwind` block of `next.js`. The UI kit package uses the `react` preset, so they do not apply to it: the shadcn components keep the arbitrary values they ship with.

> [!NOTE]
> `eslint-plugin-jsx-a11y` declares ESLint 9 at most but runs on ESLint 10; the exception, and an override that keeps `eslint-plugin-react-hooks` on the dependency version it needs, are in `pnpm-workspace.yaml` with their reasons.

## 🔗 Related

- [Code style enforcement](../../docs/conventions/code-style.md#enforcement) and [React enforcement](../../docs/conventions/react.md#enforcement)
- [TypeScript config](../typescript/README.md), which the type-aware rules read
