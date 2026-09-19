# 📄 Specs

> What a feature is supposed to do, written down and agreed before it is built.

## 🎯 Purpose

A spec answers **what should happen**, never how it is coded. It exists so that the issue, the code and the
review are all measured against the same sentences instead of against whoever remembers the conversation.

Most changes need no spec: a dependency bump, a bug with a failing test, a screen the design already
describes. Write one when the product should behave in a way nothing written says it does, and write it
**before** the implementation issue exists, as its own `docs` pull request. A question only the product owner
can answer stays in `## Open questions` rather than being settled by inference on the way past.

## 🗂️ Structure

One file per subject, `YYYY-MM-DD-<topic>.md`, the date being the day the spec was agreed. The slug is
kebab-case and names the behavior, not the ticket: `2026-04-08-invite-a-teammate.md`.

```md
---
tags: [spec, <area>]
aliases: [<Other names it goes by>]
---

# <Title>

## Purpose

## Behavior

## Out of scope

## Open questions

## Acceptance criteria
```

`/spec` writes exactly this shape. `Acceptance criteria` are the lines the issue copies and `/ship` answers
one by one with evidence, so each has to be observable by somebody who did not write the code.

## 🚀 Usage

```bash
/spec <topic>     # drafts a spec here against the architecture guide, the ADRs and the business rules
```

By hand, copy the shape above. Read [`../architecture/`](../architecture/README.md),
[`../adr/`](../adr/README.md) and [`../business-rules.md`](../business-rules.md) first: a spec that
contradicts one of them is a decision, and a decision belongs in an ADR.

Where a piece of writing belongs:

| What it is                                  | Where it goes                                           | How long it lives                       |
| ------------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| The plan for one issue                      | The issue                                               | Until its pull request merges           |
| A plan long enough to need its own document | `docs/plans/`, written with `superpowers:writing-plans` | Until it has been carried out           |
| A design the work produced that outlives it | Here                                                    | Until it is wrong                       |
| A decision that is hard to reverse          | `docs/adr/`                                             | Forever, superseded rather than deleted |
| Behavior, and the rules that cross features | Here and `docs/business-rules.md`                       | They are the source of truth            |

**A plan never goes in [`../architecture/`](../architecture/README.md).** That folder describes the system as
it is.

## 🔁 How it updates

A spec is updated when reality contradicts it, in the branch that contradicts it — never left to be corrected
later. `doc-steward` reports a diff whose behavior is not the behavior a spec describes, and an
`## Open questions` entry that was answered in code instead of in the document.

A spec that has been fully built and is no longer the best description of the system is moved to
[`../archive/`](../archive/README.md) with its name unchanged.

## 🧩 Extending

- **Keep one subject per file.** Two features in one spec cannot be accepted separately.
- **Write observable behavior.** "The list is fast" is not a criterion; "the first page renders before the
  rest of the results arrive" is.
- **Never name a class, a hook or a file.** The moment a spec names an implementation, it starts to rot with
  the implementation.

## 🔗 Related

- [Plans](../plans/README.md): how a spec is going to be built
- [Decisions](../adr/README.md): the choices a spec is not allowed to make on its own
- [Business rules](../business-rules.md): what every spec inherits without restating it
- [Contributing](../../CONTRIBUTING.md): where the spec sits in the flow
