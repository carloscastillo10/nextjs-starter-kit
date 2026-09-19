# 🎨 @repo/prettier-config

> The Prettier config for every file in the repository.

## 🎯 Purpose

Nobody formats by hand. This package holds the options of the [code standard](../../docs/conventions/code-style.md#formatting) and sorts Tailwind classes, including inside `cn()` and `cva()` calls.

## 🗂️ Structure

| File                 | Holds                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `prettier.config.js` | Print width 100, double quotes, semicolons, trailing commas, parentheses around arrow parameters, LF endings, and overrides for Markdown and JSON with comments |

- Markdown keeps its paragraphs unwrapped and its code blocks exactly as written: some examples show code the way it should not look.
- JSON with comments (`*.jsonc`, `tsconfig.json`) gets no trailing commas, which stricter parsers reject.

## 🚀 Usage

The root `package.json` declares the config once (`"prettier": "@repo/prettier-config"`), and Prettier finds it from any file below the root. A package only needs `prettier` in its `devDependencies`, the `format` scripts and a `.prettierignore` of its own:

```json
{
  "format": "prettier . --check --ignore-unknown",
  "format:fix": "prettier . --write --ignore-unknown"
}
```

**Ignore files do not inherit.** Prettier reads `.gitignore` and `.prettierignore` from the directory it runs in and nowhere else, so each workspace lists what it produces, and the root file covers what belongs to no workspace. A workspace without one formats its own build output.

## ⌨️ Commands

| Command           | What it does                           |
| ----------------- | -------------------------------------- |
| `pnpm format`     | Check every package and the root files |
| `pnpm format:fix` | Write the formatting                   |

## 🧩 Extending

- Prettier is pinned to an exact version in the `catalog` of `pnpm-workspace.yaml`: a patch release can change formatting, so upgrades are deliberate and come with a `pnpm format:fix` commit.
- An app with its own Tailwind theme points the class sorter at its stylesheet with the `tailwindStylesheet` option, in a `prettier.config.js` of its own that spreads this config.
- Files that tools write (lockfiles, the agent notes of `next dev`) belong in the `.prettierignore` of the workspace that produces them, or in the root one when they belong to none.

## 🔗 Related

- [ESLint config](../eslint/README.md): `eslint-config-prettier` switches off the rules that would disagree with Prettier.
