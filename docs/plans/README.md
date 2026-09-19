# 🧭 Plans

> Implementation plans that are too long to live in the issue they serve.

## 🎯 Purpose

Most plans belong in the issue that carries the work: scope, the vertical slice layer by layer, acceptance
criteria, what is out of scope. They die when the pull request merges, which is correct, because a plan is
worthless once it has been carried out.

A plan comes here only when it **spans several issues or several days** and somebody other than its author
will have to pick it up. That is the whole test. Writing a two-task plan here costs a file nobody deletes.

## 🗂️ Structure

One file per plan, `YYYY-MM-DD-<topic>.md`, the date being the day it was written.

```md
---
tags: [plan, <area>]
aliases: [<Other names it goes by>]
---

# <Title>

**Goal:** one sentence.

**Spec:** the document this plan implements, if there is one.

## Task 1 — <name>

- [ ] Step, small enough to finish in one sitting
- [ ] Step
```

`superpowers:writing-plans` writes here rather than in its own default folder, because this repository keeps
its written record in one tree. [`CLAUDE.md`](../../CLAUDE.md) states that preference, and the skill follows it.

## 🚀 Usage

Ask for the plan skill by name, or let a command do it:

```bash
/implement <issue>   # builds the slice the issue describes, layer by layer
```

Where a piece of writing belongs:

| What it is                                  | Where it goes                                  | How long it lives                       |
| ------------------------------------------- | ---------------------------------------------- | --------------------------------------- |
| The plan for one issue                      | The issue                                      | Until its pull request merges           |
| A plan long enough to need its own document | Here, written with `superpowers:writing-plans` | Until it has been carried out           |
| A design the work produced that outlives it | `docs/specs/`, written with `/spec`            | Until it is wrong                       |
| A decision that is hard to reverse          | `docs/adr/`                                    | Forever, superseded rather than deleted |
| Behavior, and the rules that cross features | `docs/specs/` and `docs/business-rules.md`     | They are the source of truth            |

**A plan never goes in [`../architecture/`](../architecture/README.md).** That folder describes the system as
it is; a plan describes a system that does not exist yet, and mixing the two manufactures drift.

## 🔁 How it updates

The checkboxes are ticked as the work lands, in the same branches that land it. A plan that has been carried
out moves to [`../archive/`](../archive/README.md); a plan that was abandoned moves there too, with a line at
the top saying why, because the reasoning is the part worth keeping.

What the plan taught while it was being carried out does not stay here. It goes to the document that owns it:
a decision to [`../adr/`](../adr/README.md), a convention to [`../conventions/`](../conventions/README.md), a
change of shape to [`../architecture/`](../architecture/README.md).

## 🧩 Extending

- **Steps, not intentions.** "Handle errors" is not a step; "return 409 when the invite already exists" is.
- **Each task ends somewhere green.** If a task cannot end with the gates passing, it is two tasks.
- **Name the files.** A plan that does not say which file a task touches is a summary of a plan.

## 🔗 Related

- [Specs](../specs/README.md): the behavior a plan is carrying out
- [Archive](../archive/README.md): where a finished plan goes
- [Contributing](../../CONTRIBUTING.md): the flow, and the definition of done a plan is measured against
