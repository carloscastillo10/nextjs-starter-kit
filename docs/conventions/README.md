# Conventions

How code in this repository is written: the rules every change follows, why they exist, and which tool checks each one.

## Documents

- [code-style.md](code-style.md): the TypeScript standard. File names and exports, where each kind of code goes inside a slice, naming, arrow functions, guard clauses and lookup maps instead of `switch`, SOLID with the weight on single responsibility, vertical spacing, types, imports, formatting.
- [comments.md](comments.md): when a comment earns its place, the shape it takes, what it never carries, and the comment check (`pnpm lint:comments`).
- [react.md](react.md): React and Next.js. Server and Client Components, component shape, props, hooks, state and memoization, composition, data fetching and performance, styling and accessibility.

Where code lives (layers, slices, segments, import rules) is covered by the architecture guide, [docs/architecture/feature-sliced-design.md](../architecture/feature-sliced-design.md). These documents build on it and never contradict it.

## How the rules are enforced

Each document ends with an **Enforcement** table that maps its rules to a check. Formatting is Prettier's job, most rules are ESLint rules (`pnpm lint`), comment rules are split between ESLint and `pnpm lint:comments`, and the folder structure is checked by Steiger (`pnpm --filter web lint:arch`). A rule with no check in the table is a review rule.

## Adding or changing a rule

1. Change the document that owns the topic, with a short bad and good example.
2. If a tool can check the rule, wire the check in the shared tooling configuration and add a row to the document's Enforcement table.
3. Apply the rule to the existing code in the same change, so the repository never disagrees with its own conventions.

Write one Markdown file per topic, named in kebab-case after it, and add it to the list above.
