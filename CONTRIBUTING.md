# Contributing

How changes are written and how they move into this repository: the rules every change follows, and the checks that hold them.

## 🌳 Table of contents

- [🎨 Code style](#-code-style)
- [🌿 Git workflow](#-git-workflow)

## 🎨 Code style

The full standard lives in [`docs/conventions/`](docs/conventions/README.md), one document per topic, each with bad and good examples and a table of the checks that enforce it:

| Document                                        | Covers                                                                                                     |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [code-style.md](docs/conventions/code-style.md) | TypeScript: files and exports, naming, functions, control flow, SOLID, spacing, types, imports, formatting |
| [comments.md](docs/conventions/comments.md)     | When a comment earns its place, its shape, and the comment check                                           |
| [react.md](docs/conventions/react.md)           | React and Next.js: components, props, hooks, state, composition, data fetching, styling, accessibility     |

Where code lives is decided by Feature-Sliced Design, described in [`docs/architecture/feature-sliced-design.md`](docs/architecture/feature-sliced-design.md).

The rules in short:

- **Arrow functions everywhere**, Next.js route files included, exported by name. Default exports only in route files and tool config files.
- **Guard clauses instead of nesting.** Handle the early exits first, one line each, then write the main path flat.
- **Lookup maps instead of `switch`**, typed with `satisfies Record<Union, Value>` so a missing case fails the build. No `else if` chains and no nested ternaries.
- **One responsibility per unit.** A component renders, its hook (in `model/`) holds state and handlers, pure functions live in `lib/`, named data in `config/`, requests in `api/`.
- **Code breathes.** A blank line between steps, before every `return` and after every block.
- **No comment by default.** A comment carries a reason the code cannot: never a restatement, a file path, a ticket number or commented-out code.
- **Server Components by default.** `"use client"` goes on the smallest leaf that needs it; independent requests run in parallel.
- **Props extend the root element's props**, forward `...props` and compose `className`; behavior variants come from composition, not boolean props.
- **Descriptive names**: `event`, not `e`; booleans read as questions (`isOpen`, `hasItems`).

Tools enforce what they can, so run them before you push:

| Command                       | Checks                                                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm lint`                   | ESLint: the rules in the Enforcement tables of each convention document                                     |
| `pnpm lint:comments`          | Comment citations, one-line block comments and lint directives fail; comment density and shape are reported |
| `pnpm format`                 | Prettier formatting                                                                                         |
| `pnpm --filter web lint:arch` | Feature-Sliced Design structure (Steiger)                                                                   |

Inline lint suppressions are switched off. If a rule does not fit a file, change the configuration for that file's glob and write down why.

## 🌿 Git workflow

<!-- Owned by git-workflow-agent: branching strategy, commit convention and git hooks. -->
