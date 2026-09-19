---
tags: [claude-code, conventions, moc]
aliases: [Claude guide, Agent rules]
---

# 🧠 CLAUDE.md

Guidance for Claude Code in this repository. **Short on purpose**: every rule that lives in a real document is
a pointer here, never a copy, because a rule written twice drifts and the copy is the half that goes stale.

Claude Code loads [`AGENTS.md`](./AGENTS.md) beside this file, so the registry of skills, subagents, commands
and MCP servers is already in context. It is not repeated here.

## Read before you decide

| Question                             | Document                                                                                                                    |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Where does this code go?             | [`docs/architecture/feature-sliced-design.md`](./docs/architecture/feature-sliced-design.md) — start at its placement guide |
| How is code written here?            | [`docs/conventions/`](./docs/conventions/README.md), and the `project-conventions` skill as its short form                  |
| Why was it decided this way?         | [`docs/adr/`](./docs/adr/README.md) — with the alternatives that lost                                                       |
| What must every feature obey?        | [`docs/business-rules.md`](./docs/business-rules.md) — the `BR-xx` catalog, a seed until you fill it                        |
| What is this feature supposed to do? | [`docs/specs/`](./docs/specs/README.md)                                                                                     |
| How does work move?                  | [`CONTRIBUTING.md`](./CONTRIBUTING.md) — not optional reading                                                               |
| What commands exist?                 | [`README.md`](./README.md)                                                                                                  |
| What are the design tokens?          | [`DESIGN.md`](./DESIGN.md)                                                                                                  |
| How do I write a document?           | [`docs/conventions/documentation.md`](./docs/conventions/documentation.md)                                                  |

**A written rule outranks code, and code outranks memory.** A change that contradicts one of these documents
is drift: reconcile it in the same branch, and say so explicitly when you do contradict a decision.

## Rules no tool can check

**Run the command and read its output before claiming anything is done.** Not "should pass" — passed, with
the output in front of you. `pnpm gates` runs everything CI runs.

**The default is no comment.** A file without one is the normal case, not a gap: the burden sits on the
comment to justify itself, never on its absence. Write one only where the code cannot carry the reason — a
third party's odd behavior, a rule, a choice that looks wrong and is not — and delete the rest rather than
shortening it, because a shortened restatement is still a restatement. If a comment is needed to say _what_
something does, rename the thing. **This holds in YAML, Markdown, JSON and config files too**, which
`pnpm lint:comments` does not read: no narrated steps, no labels over obvious blocks, no repeating the name of
the field above.

**A comment cites nothing** — not a file path, not a numbered section, not a ticket. Paths move and numbers
renumber, so a pointer in a comment is a stale pointer waiting to happen. Write the reason itself.

**Test behavior, not wiring.** The template ships no tests of its own: Vitest is wired in every workspace
with `passWithNoTests`, so the first one you write runs without touching any config. A test that asserts a
component rendered its own props back costs maintenance and catches nothing.

**No demo content.** The app is empty on purpose. Adding a sample page, sample data or a theme toggle to
"show how it works" is a change somebody else has to delete.

**English, everywhere that is committed**: code, comments, documentation, commit messages, issue and pull
request text.

## Ask before you implement

When a plan is finished and code is about to be written, **ask how to isolate the work**: this branch, or a
new branch of its own. `guard-bash` will refuse a push that lands on `main`, and finding that out after
twenty commits is worse than asking once.

Ask again when the work turns out to need a decision that is hard to reverse. That is an
[ADR](./docs/adr/README.md) and a conversation, not a judgement call made while implementing.

## Where your own writing goes

`superpowers:brainstorming` and `superpowers:writing-plans` default to a `docs/superpowers/` folder. **This
repository does not use it.** The design goes in [`docs/specs/`](./docs/specs/README.md) and the plan in
[`docs/plans/`](./docs/plans/README.md), both named `YYYY-MM-DD-<topic>.md`, both with frontmatter. Each
folder's README carries the shape.

Most plans belong in the issue instead and never become a file. `docs/plans/` is for a plan that spans
several issues and that somebody else will pick up.

## What is enforced for you

Hooks in [`.claude/settings.json`](./.claude/settings.json) run in every session for everybody, so none of
this is on your memory:

- **`--no-verify`, `git commit -n` and `LEFTHOOK=0` are denied**, and so is a push that lands on `main`. The
  narrow escape is `LEFTHOOK_EXCLUDE=<job>`, which names the job it skips. A hook that fires is telling you
  something true.
- **`gh pr create` gets the pull request template and the title rule injected**, plus the report of whether
  the branch looks like one thing.
- **A commit that would not carry your own git identity is refused**, and so is a push carrying a commit by an
  address nobody here uses. Never set `user.email` or `user.name` inside the repository.
- **Writing a file names the skills that govern it first**, then runs markdownlint, cspell, Prettier, the
  frontmatter check and the comment report on what you wrote.
- **The `pre-commit` hook fixes and restages** with ESLint and Prettier, so formatting is not your job. A
  partially staged file is checked and never rewritten, because rewriting one can lose the unstaged half.

## What this repository is

A **template**, which changes what "done" means: somebody will copy this tree and build a product in it, so
an empty folder with a README is a feature and a half-finished example is a defect.

| Where                                      | State                                                                                                      |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| [`apps/web`](./apps/web/README.md)         | One Next.js app rendering one blank page. Routing in `app/`, code in `src/` as FSD layers                  |
| [`packages/ui`](./packages/ui/README.md)   | The shadcn/ui kit: `Button`, `cn`, the stylesheet that registers the kit with Tailwind                     |
| [`packages/env`](./packages/env/README.md) | The environment: zod schemas, the loader, and the generated `.env.example`                                 |
| `tooling/*`                                | Shared configuration and the repository's own scripts, one workspace each                                  |
| [`docs/`](./docs/README.md)                | Mostly empty by design, with a README per folder saying what goes in it                                    |
| **Authentication**                         | **Not here.** Each product picks a provider — [ADR 09](./docs/adr/09-no-authentication-in-the-template.md) |

Every workspace carries a `README.md`, and updating it is part of the change that outdated it. `pnpm new`
refuses to create a workspace without one.

## When guides disagree

Three sources can each have an opinion about the same line of UI. The order is fixed:

1. **[`docs/conventions/`](./docs/conventions/README.md) and the UI kit.** Toasts, dialogs, popovers and form
   controls come from [`@repo/ui`](./packages/ui/README.md), even where `modern-web-guidance` shows a
   hand-built platform version. ESLint reports a raw `button`, `input`, `select`, `textarea`, `label` or
   `dialog` in app code.
2. **[`DESIGN.md`](./DESIGN.md) and the theme.** Every token lives in
   [`tooling/tailwind/theme.css`](./tooling/tailwind/README.md); `frontend-design` and the coding preferences
   inside `tailwind-css` work within that direction rather than replacing it.
3. **The skills and plugins themselves**, for everything the first two do not settle.

Three things that follow from that, and that are easy to get wrong:

- **`DESIGN.md` and `theme.css` are one change.** The document describes the values the stylesheet defines.
- **The shadcn CLI runs from `apps/web`**, not from the repository root: `cd apps/web && pnpm dlx shadcn@latest add <component>`.
  It writes the component into `packages/ui` and its variables into the shared theme.
- **Tailwind runs with `source(none)`.** A new folder whose classes should be built has to be named in an
  `@source` line, or its utilities are silently missing from the build.

One more, for the environment: **a new variable is a schema change**. Add it to a schema in
[`packages/env`](./packages/env/README.md), run `pnpm env:emit` to regenerate `.env.example`, and declare it
in `turbo.json` — `pnpm env:check` and `pnpm env:check:turbo` fail when either half is missing.

## Two pins that look wrong and are not

**TypeScript stays on `6.0.x`** while 7 is released: typescript-eslint accepts `typescript <6.1.0`, and
TypeScript 7 ships without the compiler API the type-aware rules call. **Prettier is an exact version**, not a
range, because formatting changes in patch releases and a range would rewrite files that were already correct.
Both are [ADR 05](./docs/adr/05-a-pinned-toolchain.md).

## This is an Obsidian vault

`.obsidian/` is committed with the shared settings only; everything personal is git-ignored.
[`Home.md`](./Home.md) is the map of content and [`docs/knowledge/obsidian-setup.md`](./docs/knowledge/obsidian-setup.md)
is the setup.

- **Cross-references are relative Markdown links**, never wikilinks: this repository is read on GitHub too.
- **The indexes are maintained by hand.** A document nothing links to is a document nobody finds, and
  `doc-steward` reports it.

## graphify

`graphify` builds a queryable graph of this repository into `.graphify/`, from the syntax tree of the
committed code plus the git history. It is **per clone and git-ignored**, so a teammate who never installed it
has no graph, and that is the normal case rather than a fault.

```bash
npm install -g @sentropic/graphify   # once per machine
pnpm graph                           # about two seconds here
```

- **If `.graphify/GRAPH_REPORT.md` exists, read it before grepping.** If it does not, search normally and say
  so rather than reporting a graph you do not have.
- For a cross-module "how does X reach Y", `graphify query`, `graphify path` and `graphify explain` walk the
  edges instead of scanning files.
- Four git hooks keep it current in the background. Run `pnpm graph` by hand after a large rebase.
- **The graph is code and history, not prose.** `docs/` is not in it: the pass that would read prose sends
  file contents to a model provider and bills per run. [`docs/knowledge/`](./docs/knowledge/README.md) is the
  whole picture.
