---
tags: [adr, linting, eslint, nextjs]
aliases: [ADR 06, ESLint without eslint-config-next]
status: accepted
---

# ESLint 10 with the plugins declared one by one, not `eslint-config-next`

[`@repo/eslint-config`](../../tooling/eslint/README.md) composes ESLint 10 out of named plugins:
`@eslint/js`, `typescript-eslint` in its type-checked strict form, `eslint-plugin-react-hooks`,
`@eslint-react/eslint-plugin`, `@next/eslint-plugin-next`, `eslint-plugin-jsx-a11y`,
`@stylistic/eslint-plugin`, `eslint-plugin-perfectionist`, `eslint-plugin-check-file`,
`eslint-plugin-prefer-arrow-functions`, `eslint-plugin-better-tailwindcss` and `eslint-config-prettier` last.
`eslint-config-next`, which bundles a subset of these, is not installed.

The reason is a version floor, not taste. On ESLint 10, `eslint-config-next` leaves peers unresolved: the
plugins it depends on declare ESLint 9 or lower. Declaring each plugin directly keeps the repository on the
current major, and it makes the rule set readable — every block in the config carries a `name`, so
`eslint --inspect-config` says which block owns a rule.

## Considered options

**`eslint-config-next`, staying on ESLint 9.** Rejected: the standard this repository enforces needs rules
from `@eslint-react` and `@stylistic` that the Next.js config does not carry, so the config would have been
extended anyway, and the version floor would have been set by the most conservative dependency.

**A single shared preset with no per-workspace files.** Rejected: typed rules need a `tsconfig` per
workspace, and `better-tailwindcss` needs the path of the stylesheet that defines the theme. Both are
per-workspace facts.

## Consequences

- A Next.js release that adds a lint rule does not arrive by itself; `@next/eslint-plugin-next` is bumped and
  the new rule is turned on deliberately.
- `@next/next/no-html-link-for-pages` is off, because it looks for a `pages/` directory and warns that it
  cannot find one in an App Router project.
- Two peer ranges lag behind what the package actually supports, and each is allowed by name in
  `peerDependencyRules` with the reason next to it, rather than by loosening peer checking globally.
- Inline suppressions are off (`noInlineConfig`). A rule that does not fit a file is changed for that file's
  glob, in the config, where the next reader can see it.
