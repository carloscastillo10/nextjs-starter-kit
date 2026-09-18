# 🔍 @repo/eslint-config

> ESLint flat config presets that enforce the repository's code standard.

## 🎯 Purpose

One place for every lint rule of the [code conventions](../../docs/conventions/README.md): the TypeScript and React standards, the Feature-Sliced Design limits on route files and slice UI, and the Next.js and accessibility rules. It runs on ESLint 10 with each plugin picked on its own, without `eslint-config-next`.

## 🗂️ Structure

| File        | Export                                               | For                                                                           |
| ----------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| `base.js`   | `base`                                               | Any TypeScript or JavaScript package                                          |
| `react.js`  | `react`                                              | React libraries: `base` plus React, hooks and accessibility rules             |
| `next.js`   | `next`                                               | Next.js apps: `react` plus Next.js rules and the Feature-Sliced Design limits |
| `syntax.js` | `BASE_SYNTAX`, `COMPONENT_SYNTAX`, `SLICE_UI_SYNTAX` | Selector lists for `no-restricted-syntax`, composed by the presets            |

Each preset is `base`'s rules, its own blocks, and a closing set: JavaScript files without type information, `eslint-config-prettier`, and `curly` after it. Every block has a `name`, so `pnpm exec eslint --inspect-config` shows where a rule comes from.

## 🚀 Usage

```js
// eslint.config.mjs of a Next.js app
import { next } from "@repo/eslint-config/next";
import { defineConfig } from "eslint/config";

export default defineConfig([
  next,
  {
    name: "web/type-information",
    languageOptions: { parserOptions: { tsconfigRootDir: import.meta.dirname } },
  },
]);
```

Add `@repo/eslint-config` and `eslint` to the package's `devDependencies` and a `lint` script (`eslint .`). Type-aware rules read the package's `tsconfig.json`, so a package with TypeScript needs one.

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
- **Restrict raw elements in favor of a UI kit**: add a list such as `UI_KIT_SYNTAX` with a `JSXOpeningElement[name.name=/^(button|input|select|textarea|label|dialog)$/]` selector and spread it into the blocks for the app's `src/**/*.tsx` files.
- **Tailwind rules**: add the `eslint-plugin-better-tailwindcss` plugin in a block of `next.js` that targets the app's source files.

> [!NOTE]
> `eslint-plugin-jsx-a11y` declares ESLint 9 at most but runs on ESLint 10; the exception, and an override that keeps `eslint-plugin-react-hooks` on the dependency version it needs, are in `pnpm-workspace.yaml` with their reasons.

## 🔗 Related

- [Code style enforcement](../../docs/conventions/code-style.md#enforcement) and [React enforcement](../../docs/conventions/react.md#enforcement)
- [TypeScript config](../typescript/README.md), which the type-aware rules read
