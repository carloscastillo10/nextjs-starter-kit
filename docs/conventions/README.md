# 📐 Conventions

> How code and documentation in this repository are written: the rules every change follows, why they exist, and which tool checks each one.

## 🎯 Purpose

A convention exists so that two people, or a person and an agent, produce the same shape from the same task.
Each document here states one topic's rules with a bad and a good example, and ends with a table that maps
every rule to the check that holds it. A rule with no check in that table is a review rule, and it says so.

Where code lives — layers, slices, segments, import rules — is not decided here. That is
[Feature-Sliced Design](../architecture/feature-sliced-design.md); these documents build on it and never
contradict it.

## 🗂️ Structure

| Document                             | Covers                                                                                                                                                                                               |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [code-style.md](code-style.md)       | TypeScript: file names and exports, where each kind of code goes inside a slice, naming, arrow functions, guard clauses, lookup maps instead of `switch`, SOLID, spacing, types, imports, formatting |
| [comments.md](comments.md)           | When a comment earns its place, the shape it takes, what it never carries, and the comment check                                                                                                     |
| [react.md](react.md)                 | React and Next.js: Server and Client Components, component shape, props, hooks, state and memoization, composition, data fetching, styling, accessibility                                            |
| [documentation.md](documentation.md) | Markdown: the one README template, frontmatter, headings and anchors, badges, links, alerts and diagrams, and the prose rules                                                                        |

## 🚀 Usage

A rule nobody reads at the right moment is a rule that gets broken, so the standard arrives three times:

- **Before the first line.** The `project-conventions` skill in
  [`.claude/skills/`](../../.claude/skills/README.md) holds these documents in short form, and a hook names
  it, with the skills that govern the path, as each file is written. It is the same standard, kept short
  enough to stay in context; when the two disagree, these documents win.
- **While the change is written.** The commands below run on demand, when a file is saved, and again in the
  `pre-commit` hook.
- **After the code exists.** The [`code-steward`](../../.claude/agents/code-steward.md) agent reads the diff
  for what no linter can express: comments that restate the code, tests that assert wiring instead of
  behavior, scope nobody asked for, a rule implemented in a component instead of the layer that owns it, an
  abstraction with one caller. [`doc-steward`](../../.claude/agents/doc-steward.md) reads the same diff for
  documentation that the change left stale.

## ⌨️ Commands

| Command                 | Checks                                                                      |
| ----------------------- | --------------------------------------------------------------------------- |
| `pnpm lint`             | ESLint, plus the two architecture linters                                   |
| `pnpm lint:fix`         | The same, applying what ESLint can fix                                      |
| `pnpm lint:comments`    | Comment citations, one-line block comments and lint directives              |
| `pnpm format`           | Prettier                                                                    |
| `pnpm lint:md`          | markdownlint over every Markdown file                                       |
| `pnpm lint:frontmatter` | The `tags` and `aliases` a document carries, and the `status` of a decision |
| `pnpm spell:check`      | cspell over code and documentation                                          |

## 🧩 Extending

1. Change the document that owns the topic, with a short bad and good example.
2. If a tool can check the rule, wire the check in the shared tooling configuration and add a row to that
   document's **Enforcement** table.
3. Apply the rule to the existing code in the same change, so the repository never disagrees with its own
   conventions.
4. Bring the one-line form of the rule to the `project-conventions` skill, in the same change. A skill that
   contradicts the document it summarizes is worse than no skill.

A new topic is one more Markdown file, named in kebab-case after the topic, plus a row in the table above.

## 🔗 Related

- [Architecture](../architecture/README.md): where code lives, and the checks that hold the structure
- [Decisions](../adr/README.md): why the repository has this shape, with the alternatives that lost
- [Contributing](../../CONTRIBUTING.md): the flow a change follows, and the hooks it passes through
- [`tooling/`](../../tooling/README.md): the shared configuration these commands read
