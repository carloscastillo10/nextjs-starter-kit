# Code style

The TypeScript standard for every workspace in this repository. Comments have their own document, [comments.md](comments.md), and so do React and Next.js, [react.md](react.md). This one covers everything else. Where a tool checks a rule, the [Enforcement](#enforcement) table names the check.

Three ideas sit under every rule below:

- **Code is read far more often than it is written.** Write for the next reader: names that say what a thing is, one level of nesting, a blank line between steps.
- **One responsibility per unit.** A module, a component, a hook and a function each do one job and have one reason to change.
- **Tools hold the line.** A rule a linter can check is checked by the linter, so review can spend its time on what no tool can judge.

## Contents

- [Files and exports](#files-and-exports)
- [Where code goes](#where-code-goes)
- [Naming](#naming)
- [Functions](#functions)
- [Control flow](#control-flow)
- [SOLID, with the weight on SRP](#solid-with-the-weight-on-srp)
- [Readability and vertical spacing](#readability-and-vertical-spacing)
- [Types](#types)
- [Imports](#imports)
- [Formatting](#formatting)
- [Lint suppressions](#lint-suppressions)
- [Enforcement](#enforcement)

## Files and exports

**File names follow the extension.**

| File | Case | Example |
| --- | --- | --- |
| React component (`.tsx`) in `apps/*/src` | PascalCase, named after the component it exports | `HomePage.tsx`, `LoginForm.tsx` |
| Any other module (`.ts`, `.mjs`, ...) | kebab-case | `format-price.ts`, `use-login-form.ts`, `get-product.ts` |
| Next.js route files in `apps/*/app` | the name Next.js expects | `page.tsx`, `layout.tsx`, `not-found.tsx`, `route.ts` |
| Files the shadcn CLI generates in `packages/*` | the kebab-case name the CLI gives them | `button.tsx` |

Middle extensions are not part of the name: `index.server.ts`, `format-price.test.ts` and `steiger.config.ts` are all kebab-case.

- **`.tsx` only when the file contains JSX.** A hook, a helper or a config module is `.ts`, so the extension alone tells you what the file holds.
- **One component per file.** A piece of JSX large enough to deserve a name gets its own file in the same `ui/` segment.
- **Named exports only, written at the declaration.**

  ```ts
  // Bad
  const formatPrice = (amount: number) => { /* ... */ };
  export default formatPrice;

  // Good
  export const formatPrice = (amount: number) => { /* ... */ };
  ```

- **Default exports exist only where a framework requires one**: Next.js route files in `app/` and tool config files (`next.config.ts`, `steiger.config.ts`). A route file re-exports the page under `default`:

  ```tsx
  export { HomePage as default } from "@/_pages/home";
  ```

- **No `export *`.** A public API (`index.ts`) names every export, so its surface stays visible in one place:

  ```ts
  // Bad
  export * from "./ui/LoginForm";

  // Good
  export { LoginForm } from "./ui/LoginForm";
  ```

## Where code goes

The folder structure is Feature-Sliced Design, described in [docs/architecture/feature-sliced-design.md](../architecture/feature-sliced-design.md). Inside a slice, each kind of code has one segment:

| What | Segment | Example file |
| --- | --- | --- |
| A component | `ui/` | `ui/LoginForm.tsx` |
| The hook that holds a component's logic and state | `model/` | `model/use-login-form.ts` |
| Pure functions the slice needs | `lib/` | `lib/validate-email.ts` |
| Named data: lookup maps, option lists, thresholds, fallback labels | `config/` | `config/login-errors.ts` |
| Domain types and rules | `model/` | `model/order.ts` |
| Requests, query and mutation hooks, Server Actions, transport types | `api/` | `api/get-product.ts` |

- Segment names describe what the code is for. `hooks`, `components`, `utils`, `helpers`, `types` and `constants` describe what the code is, and the architecture linter rejects them.
- Files are named after the domain they serve (`model/order.ts`), never after a technical role (`model/types.ts`, `lib/helpers.ts`).
- A new utility gets a new file; do not grow an unrelated one.
- A constant holding a trivial literal (an offset, a single class string used once) can stay inline. A constant that carries meaning (a map, a threshold, a fallback label) goes to `config/`, even when one file uses it.

## Naming

| Kind | Format | Example |
| --- | --- | --- |
| Variables, functions, parameters | camelCase | `activeUsers`, `formatPrice` |
| Components | PascalCase | `LoginForm` |
| Types | PascalCase | `LoginError`, `LoginFormProps` |
| Module-level constants that hold named data | UPPER_CASE | `LOGIN_ERROR_MESSAGES`, `EMAIL_PATTERN` |
| Hooks | `use` + PascalCase | `useLoginForm` |
| A hook's input type | `Use<Name>Options` | `UseLoginFormOptions` |
| A component's props type | `<Name>Props` | `LoginFormProps` |
| Event handlers | `handle<Event>` where defined, `on<Event>` as a prop | `handleSubmit` passed as `onSubmit` |

- **Booleans read as a yes-or-no question**: `isOpen`, `hasItems`, `shouldRetry`, `canEdit`, `didLoad`, `willExpire`.
- **Names are words, not fragments.** `event`, not `e`; `error`, not `err`; `request`, not `req`; `(link) => link.href`, not `(l) => l.href`. The exceptions are `i` for a plain loop index, `x` and `y` for coordinates, and `_` for a parameter that is deliberately unused.
- **Name by purpose, not by type**: `activeUsers`, not `userArray`.
- **If a thing needs a comment to explain what it is, rename it.**

## Functions

**Every function is an arrow function**: components, hooks, handlers, helpers, Server Actions, Route Handlers and `generateMetadata`. The exceptions are the ones the language forces: methods of a class or an object literal, and generators (`function*`).

```ts
// Bad
export function formatPrice(amount: number) { /* ... */ }
export const formatPrice = function (amount: number) { /* ... */ };

// Good
export const formatPrice = (amount: number) => { /* ... */ };
```

Next.js route files are no exception. Next.js reads the module's exports, so an arrow assigned to a constant works for a default export, for `generateMetadata`, `generateStaticParams`, a `proxy`, a Route Handler and a Server Action:

```tsx
const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
```

- **One job per function.** If the honest name needs "and", split it.
- **At most three parameters.** Past that, take one options object with named fields.
- **No boolean parameter that picks between two behaviors.** `render(true)` tells the reader nothing; write two functions, or take an options object with a named field.
- **Orchestrate, do not implement.** A long function reads as a list of calls to named steps, each step a small function of its own:

  ```ts
  const handleDrop = (event: DragEvent) => {
    const delta = measureDelta(event, origin);
    const snapped = snapToGrid(delta, GRID_SIZE);

    if (isOutOfBounds(snapped, bounds)) return;

    commitMove(snapped);
  };
  ```

- **Do not mutate inputs.** Return a new value: `toSorted`, `toReversed`, spread and `map` instead of `sort`, `reverse`, `push` on a parameter.

## Control flow

### Guard clauses

Handle the cases that stop early at the top, then write the main path without nesting.

```ts
// Bad
const submit = (form: LoginValues | null) => {
  if (form) {
    if (form.email) {
      if (isValidEmail(form.email)) {
        send(form);
      } else {
        showError("invalid-email");
      }
    } else {
      showError("missing-email");
    }
  }
};

// Good
const submit = (form: LoginValues | null) => {
  if (!form) return;
  if (!form.email) return showError("missing-email");
  if (!isValidEmail(form.email)) return showError("invalid-email");

  send(form);
};
```

A guard clause fits on one line without braces. Every other `if` body uses braces, and so does a guard clause that Prettier has to wrap onto a second line.

### Lookup maps instead of `switch`

`switch` is not used. Dispatch between variants with an object keyed by the variant, typed so the compiler catches a missing key:

```ts
// Bad
const getStatusLabel = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "Waiting for payment";
    case "paid":
      return "Paid";
    default:
      return "Cancelled";
  }
};

// Good: config/order-status.ts
export const ORDER_STATUS_LABELS = {
  cancelled: "Cancelled",
  paid: "Paid",
  pending: "Waiting for payment",
} satisfies Record<OrderStatus, string>;

// at the call site
const label = ORDER_STATUS_LABELS[status];
```

- `satisfies Record<Union, Value>` fails the build when a new status has no entry.
- A map can hold behavior too: `Record<ShapeKind, (shape: Shape) => number>`.
- When the key comes from outside the union (a string from the network), fall back explicitly: `STATUS_LABELS[status] ?? UNKNOWN_STATUS_LABEL`.
- **Registries instead of chained checks.** `kind === "circle" || kind === "square" || ...` grows with every new kind. Declare a registry, `Record<ShapeKind, ShapeCapabilities>`, where each kind lists its flags, and read `SHAPE_CAPABILITIES[kind].isResizable`. Adding a kind is one new row.

### No `else if`, no nested ternaries

- **No `else if` chains.** Three or more branches become guard clauses or a lookup map.
- **No `else` after `return`.** The early return already ends the branch.
- **A ternary never nests.** `a ? x : b ? y : z` becomes a small function with guard clauses.
- **Do not negate a condition that has an `else`.** Swap the branches: `if (isReady) { ... } else { ... }`, not `if (!isReady)`.

### Depth and complexity

Blocks nest at most two levels inside a function, a function has a cyclomatic complexity of at most 10, and callbacks nest at most three deep. Code that hits a limit is asking for a guard clause, a lookup map or an extracted function.

## SOLID, with the weight on SRP

**Single responsibility** is the principle this codebase leans on hardest. Each unit has one reason to change:

| Unit | Its one job | What gets split out |
| --- | --- | --- |
| Module (file) | One concept of its segment | Unrelated helpers go to their own files |
| Component | Render markup from the values it receives | State, effects and derivations go to a hook |
| Hook | Own one piece of state or one side effect, and expose it | Pure computation goes to `lib/`, named data to `config/` |
| Function | One transformation or one step | Each extra step becomes a named function |

Signals that a unit does too much: a file over 250 lines, a function over 60, a name that needs "and", a hook that returns unrelated values, a component with several pieces of state.

The other four principles, as they apply to functional TypeScript:

- **Open/closed**: add a variant by adding a row to a lookup map or a new component, not by editing a chain of conditions.
- **Liskov substitution**: a component whose props extend `ComponentProps<"button">` behaves like a button. It forwards `...props` and composes `className` instead of dropping them.
- **Interface segregation**: accept what you use. A function that reads `user.name` takes `name: string`, not the whole `User`.
- **Dependency inversion**: pass behavior in (callbacks, options) instead of reaching for it. Lower layers never import from higher ones, and a lower-layer module that needs higher-layer behavior receives it as a parameter.

## Readability and vertical spacing

Code breathes: a function body is a sequence of steps, and a blank line separates one step from the next.

- Group the body in this order, with a blank line between groups: declarations and state, derived values, handlers, effects, `return`.
- Put a blank line before every `return`, unless it is the only statement in its block.
- Put a blank line after a group of declarations. Consecutive declarations stay together.
- Put a blank line before an `if`, `for`, `while` or `try` that starts a new step, and after every block that closes with `}`. Consecutive one-line guard clauses stay together.
- Put a blank line after a directive (`"use client"`, `"use server"`) and after the imports.
- Never leave more than one blank line in a row.
- In JSX, separate large sibling sections with a blank line. Never put blank lines between props.

```ts
// Bad
const getDiscount = (order: Order) => {
  const subtotal = sumLines(order.lines);
  if (subtotal < MINIMUM_FOR_DISCOUNT) return 0;
  const rate = DISCOUNT_RATES[order.tier];
  return subtotal * rate;
};

// Good
const getDiscount = (order: Order) => {
  const subtotal = sumLines(order.lines);

  if (subtotal < MINIMUM_FOR_DISCOUNT) return 0;

  const rate = DISCOUNT_RATES[order.tier];

  return subtotal * rate;
};
```

## Types

- **`type`, not `interface`.** One way to declare a shape, and it composes with `&`, unions and mapped types.
- **No `enum`.** Use a union of string literals. When the values are also needed at runtime, derive the union from an `as const` object:

  ```ts
  export const ORDER_STATUSES = ["pending", "paid", "cancelled"] as const;

  export type OrderStatus = (typeof ORDER_STATUSES)[number];
  ```

- **`import type` and `export type`** for anything used only as a type.
- **`unknown`, never `any`.** Narrow `unknown` with a check before using it. No non-null assertions (`value!`); narrow instead.
- **`satisfies` to check a literal without widening it**, as in the lookup maps above.
- **Let inference work.** Never annotate a hook's return type. Annotate a function's return type when it is a contract other modules rely on, such as a public helper in `lib/` or a request in `api/`.
- **One source of truth per shape.** A shape that several files pass around is declared once, in `model/` (or in `shared/api` for transport types), and imported everywhere.

## Imports

- Order, fixed automatically by the linter, with a blank line between groups: side-effect imports (stylesheets), Node.js built-ins, packages (including the workspace packages `@repo/*`), the `@/` alias, relative paths. A type import sits next to the value imports of its group.
- Use the `@/` alias to reach another slice or layer, and a relative path inside the same slice.
- Import a slice through its public API: `@/features/like-post`, never `@/features/like-post/ui/LikeButton`.
- Route files in `app/` import only from `@/_pages/*` and `@/_app/*`.

## Formatting

Prettier formats everything, so nobody formats by hand: a print width of 100, double quotes, semicolons, trailing commas wherever the syntax allows them, parentheses around every arrow parameter, LF line endings. Indentation is two spaces (`.editorconfig`).

## Lint suppressions

Inline ESLint directives (`// eslint-disable-next-line`, `/* eslint-disable */`) are switched off: the linter ignores them and the comment check fails on them.

- When a rule is wrong for a file, change the config for that file's glob and write the reason next to the override.
- A warning left on purpose stays visible. The usual case is `react-hooks/exhaustive-deps` on a dependency omitted deliberately; it keeps its warning and gets no comment explaining it away.
- Do not reshape code only to dodge a rule. If the rule keeps getting in the way, question the rule in review.

## Enforcement

`pnpm lint` runs ESLint and `pnpm lint:comments` runs the comment check described in [comments.md](comments.md#the-comment-check). Everything not listed here is checked in review.

| Rule | Check |
| --- | --- |
| Component files PascalCase, other modules kebab-case | `check-file/filename-naming-convention` |
| Named exports only; defaults in route files and config files | `no-restricted-exports` (switched off for `app/**` and `*.config.*`) |
| No `export *` | `no-restricted-syntax` (`ExportAllDeclaration`) |
| Naming formats and boolean prefixes | `@typescript-eslint/naming-convention` |
| No clipped names | `id-length`, `id-denylist` |
| Arrow functions | `func-style`, `prefer-arrow-callback`, `no-restricted-syntax` (`FunctionExpression`, `ExportDefaultDeclaration > FunctionDeclaration`) |
| At most three parameters | `@typescript-eslint/max-params` |
| No `switch` | `no-restricted-syntax` (`SwitchStatement`) |
| No `else if` chains, no `else` after `return` | `no-restricted-syntax` (`IfStatement > IfStatement.alternate`), `no-else-return`, `no-lonely-if` |
| No nested ternaries, no negated conditions with `else` | `no-nested-ternary`, `no-negated-condition` |
| Braces except on one-line guard clauses | `curly` (`multi-line`) |
| Depth and complexity limits | `max-depth` (2), `complexity` (10), `max-nested-callbacks` (3) |
| Size signals (warnings) | `max-lines` (250), `max-lines-per-function` (60) |
| Blank lines between steps | `@stylistic/padding-line-between-statements` |
| `type` over `interface`, no `enum` | `@typescript-eslint/consistent-type-definitions`, `no-restricted-syntax` (`TSEnumDeclaration`) |
| Type-only imports and exports | `@typescript-eslint/consistent-type-imports`, `@typescript-eslint/consistent-type-exports` |
| Import order | `perfectionist/sort-imports` |
| Route files import only from `_pages` and `_app` public APIs | `no-restricted-imports` (for `app/**`) |
| Formatting | Prettier |
| No inline lint directives | `linterOptions.noInlineConfig` and the comment check |
