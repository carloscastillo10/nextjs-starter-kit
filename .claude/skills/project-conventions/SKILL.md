---
name: project-conventions
description: >-
  The code standard of this repository, in short form: file names and exports,
  arrow functions, guard clauses, lookup maps instead of switch, one
  responsibility per unit, comments that carry a reason, Server Components by
  default, the UI kit first. Use before writing or changing TypeScript, React or
  Next.js code here, when deciding the shape of a function or a name, and when
  reviewing a diff.
user-invocable: true
---

# Project conventions

The rules every change in this repository follows. This is the short form, meant to stay in context while you write; the full statement, with bad and good examples and the check that enforces each rule, is in `docs/conventions/`.

**When this file and a document disagree, the document wins.** Open the document when a rule here is not enough, and change the document first when a rule itself has to change.

## Where the full rule lives

| Topic                                                                      | Document                                     |
| -------------------------------------------------------------------------- | -------------------------------------------- |
| TypeScript: files, names, functions, control flow, SOLID, spacing, imports | `docs/conventions/code-style.md`             |
| When a comment earns its place, and what it never carries                  | `docs/conventions/comments.md`               |
| React and Next.js: components, props, hooks, state, data fetching, styling | `docs/conventions/react.md`                  |
| Markdown: the README template, frontmatter, links, alerts                  | `docs/conventions/documentation.md`          |
| Where code goes: layers, slices, segments, import rules                    | `docs/architecture/feature-sliced-design.md` |
| Design tokens and how the theme is meant to be used                        | `DESIGN.md`                                  |

For placement, load the `feature-sliced-design` skill as well; for components and tokens, `shadcn` and `tailwind-css`.

## Files and exports

- `.tsx` only when the file holds JSX. A hook, a helper or a config module is `.ts`.
- Components in `apps/*/src` are PascalCase and named after what they export; every other module is kebab-case. Route files keep the name Next.js expects.
- One component per file. Named exports, written at the declaration.
- `export default` exists only in `app/**` route files and tool config files. No `export *`: a public API names every export.

## Functions

- **Every function is an arrow function**, route files included. The exceptions are object and class methods and generators.
- At most three parameters; past that, one options object with named fields.
- No boolean parameter that picks between two behaviors. Write two functions.
- Orchestrate, do not implement: a long function reads as a list of calls to named steps.
- Never mutate an input. Return a new value (`toSorted`, spread, `map`).

## Control flow

- **Guard clauses first.** Handle the early exits at the top, one line each without braces, then write the main path flat. Every other `if` body takes braces.
- No `else` after `return`, no `else if` chains, no nested ternaries, no condition negated when it has an `else`.
- **A lookup map instead of `switch`.** `switch` is not used here:

  ```ts
  export const ORDER_STATUS_LABELS = {
    cancelled: "Cancelled",
    paid: "Paid",
    pending: "Waiting for payment",
  } satisfies Record<OrderStatus, string>;
  ```

  `satisfies Record<Union, Value>` fails the build when a new member of the union has no entry. A map holds behavior too, and a registry replaces a chain of equality checks.

- At most two levels of nesting inside a function. Hitting the limit asks for a guard clause, a map or an extracted function.

## Naming

- Names are words, not fragments: `event`, not `e`; `error`, not `err`. The linter denies twenty-five clipped forms, `ctx`, `fn`, `opts`, `acc` and `msg` among them; the exceptions are `i`, `x`, `y` and `_`.
- Booleans read as a yes-or-no question: `isOpen`, `hasItems`, `shouldRetry`, `canEdit`.
- Name by purpose, not by type: `activeUsers`, not `userArray`.
- Handlers are `handleSubmit` where defined and `onSubmit` as a prop. A hook's options type is `UseXOptions`, a component's props type is `XProps`.
- **If a thing needs a comment to say what it is, rename it.**

## One responsibility per unit

A component renders what it receives. Its state, derived values and handlers live in a hook in `model/`. Pure functions live in `lib/`, named data in `config/`, requests and Server Actions in `api/`, domain types and rules in `model/`.

A file over 250 lines, a function over 60, a name that needs "and", or a hook that returns unrelated values: each is a signal to split, not a rule to argue with.

## Vertical spacing

Code breathes. A blank line separates one step from the next, sits before every `return`, after a group of declarations, after the imports and after a directive. Never two blank lines in a row, and never a blank line between props.

## Types

- `type`, never `interface`. No `enum`: use a union of string literals, derived from an `as const` array when the values are needed at run time.
- `unknown`, never `any`; narrow instead of asserting, and no non-null assertion (`value!`).
- `import type` and `export type` for anything used only as a type.
- Let inference work. Never annotate a hook's return type; annotate a function's return type when it is a contract other modules rely on.

## React and Next.js

- **Server Components until the client is needed.** `"use client"` goes on the smallest leaf, never on a page, and only the fields a client component reads cross the boundary.
- **No state or effect hooks in a slice's `ui/` file.** They belong in the component's hook. A provider in `_app/providers` and a map of renderers built with `useMemo` are the two exceptions.
- No `if` in a component body; branch inside the JSX. A Server Component calling `notFound`, `redirect`, `forbidden` or `unauthorized` is not a branch.
- No computation in JSX props: no arithmetic or comparison, no object or array written there, no ternary, no template literal with an expression, no `&&` or `||`, no `.map()`. Compute it in the hook or name it as a constant. What the prop receives may be a call, so `cn("tab", isActive ? "a" : "b")` and `cn(buttonVariants({ size: "lg" }), "w-full")` are both fine. `&&` only with a boolean.
- No JSX stored in a constant: markup stays where it renders, or becomes a component.
- Props extend the root element's props, the rest is named `props` and spread, and `className` is composed with `cn`, never replaced. A props type stays next to its component and is never exported; another component derives it with `ComponentProps<typeof X>`.
- `className` first and callbacks last, in the props type, in the destructuring, in the JSX and in what a hook returns. The linter fixes all four.
- No boolean props that switch behavior: build explicit variants through composition, or one union prop declared with `cva`.
- **The UI kit first.** An app never writes `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>` or `<dialog>` by hand: it uses the component from `@repo/ui`, and a missing one is added to the kit with the shadcn CLI. Semantic containers and headings are used directly.
- Styling uses the theme tokens (`bg-background`, `text-muted-foreground`). In app code there are no arbitrary values, and class names stay static so Tailwind can find them; the kit keeps what the CLI generates.

## Comments

- **The default is no comment.** A comment carries a reason the code cannot: a third party's surprising behavior, a rule whose origin the code does not show, a choice that reads as a mistake and is not.
- Delete a comment that restates the code instead of shortening it.
- A comment never carries a path, a file name, an issue number, a numbered section, commented-out code, a `TODO`, a lint directive or metadata git already keeps.
- A multi-line comment is one block, never a stack of `//` lines, and a block comment never sits on a single line.
- The same discipline applies to YAML, Markdown and configuration files, where no check reaches. No narrated steps, no labels repeated from the key below them.

## Lint suppressions

Inline ESLint directives are switched off: the linter ignores them and the comment check fails on them. When a rule is wrong for a file, change the configuration for that file's glob and write the reason next to the override.

## Before you finish

```bash
pnpm lint            # ESLint and the architecture linter
pnpm lint:comments   # citations, one-line blocks, lint directives
pnpm format          # Prettier
pnpm types:check     # TypeScript in strict mode
```

`pnpm gates` runs everything CI runs, in one command. A finding is fixed, not suppressed.
