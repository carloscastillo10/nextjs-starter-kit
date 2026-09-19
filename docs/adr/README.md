# 🏛️ Decisions

> One file per choice that is hard to reverse, with the alternatives that lost.

## 🎯 Purpose

An ADR — an Architecture Decision Record — answers **why does this repository have this shape?** It is not a
description of how something works; it is the record of a choice, so that nobody spends a week "fixing"
something that was deliberate.

A decision belongs here only when all three are true. If it fails any one, leave it out:

| Test                               | Why it matters                                                           |
| ---------------------------------- | ------------------------------------------------------------------------ |
| **Hard to reverse**                | An easy decision gets reversed rather than recorded                      |
| **Surprising without the context** | If nobody would wonder why, there is nothing to explain                  |
| **The result of a real trade-off** | With no alternative, there is nothing to record beyond doing the obvious |

> [!NOTE]
> Not a spec, and not a convention. What the product does lives in [`../specs/`](../specs/README.md); how code
> is written lives in [`../conventions/`](../conventions/README.md); how the system is shaped today lives in
> [`../architecture/`](../architecture/README.md). This folder holds the reasoning those three assume.

## 🗂️ Structure

| #                                                   | Decision                                                                    | Status   |
| --------------------------------------------------- | --------------------------------------------------------------------------- | -------- |
| [01](01-feature-sliced-design-in-the-app-router.md) | Feature-Sliced Design under the Next.js App Router                          | accepted |
| [02](02-one-path-alias-per-app.md)                  | One path alias per app, pointing at the FSD root                            | accepted |
| [03](03-shared-code-in-workspace-packages.md)       | Shared code lives in `@repo/*` packages, and may hold FSD layers of its own | accepted |
| [04](04-two-architecture-linters.md)                | Two architecture linters, with no overlap between them                      | accepted |
| [05](05-a-pinned-toolchain.md)                      | The toolchain is pinned, and the package manager refuses a wrong version    | accepted |
| [06](06-eslint-without-the-next-config.md)          | ESLint 10 with the plugins declared one by one, not `eslint-config-next`    | accepted |
| [07](07-design-tokens-in-one-package.md)            | Every design token lives in one Tailwind CSS v4 package                     | accepted |
| [08](08-github-flow-with-enforced-commits.md)       | GitHub Flow, squash merges, and a commit convention a hook enforces         | accepted |
| [09](09-no-authentication-in-the-template.md)       | The template ships without authentication                                   | accepted |

[`template.md`](template.md) is the shape to copy, and is not a decision.

## 🚀 Usage

Read a decision before changing what it decided. `/spec` and `/feature` read this folder before drafting, and
[`doc-steward`](../../.claude/agents/doc-steward.md) reports a change that quietly contradicts one.

Where a piece of writing belongs:

| What it is                                  | Where it goes                                           | How long it lives                       |
| ------------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| The plan for one issue                      | The issue                                               | Until its pull request merges           |
| A plan long enough to need its own document | `docs/plans/`, written with `superpowers:writing-plans` | Until it has been carried out           |
| A design the work produced that outlives it | `docs/specs/`, written with `/spec`                     | Until it is wrong                       |
| A decision that is hard to reverse          | Here                                                    | Forever, superseded rather than deleted |
| Behavior, and the rules that cross features | `docs/specs/` and `docs/business-rules.md`              | They are the source of truth            |

**A plan never goes in [`../architecture/`](../architecture/README.md)**, and neither does a decision: that
folder says what the system is, this one says why.

## 🧩 Extending

Copy [`template.md`](template.md) to `NN-slug.md`, numbering from the highest here, and add a row to the table
above in the same commit. Keep it short: what the context was, what was decided, and why. Add
**Considered options** only when a rejected alternative is worth remembering, and **Consequences** only when a
downstream effect is not obvious from the decision itself.

`status` is one of `proposed`, `accepted`, `superseded`, `deprecated`, and `pnpm lint:frontmatter` fails
without it.

Contradicting an existing decision is allowed and expected as a system grows. Say so explicitly rather than
quietly overriding it: mark the old one `superseded`, say in its text which number replaced it, and name the
old one in the new one.

## 🔗 Related

- [Architecture](../architecture/README.md): how the system is shaped today, which is what these decisions produced
- [Conventions](../conventions/README.md): how code is written, which is a different kind of rule
- [Contributing](../../CONTRIBUTING.md): when a change needs a decision record
