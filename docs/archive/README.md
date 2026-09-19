# 🗄️ Archive

> Specs and plans that are finished or superseded, kept because the reasoning outlives the document.

## 🎯 Purpose

A plan that was carried out and a spec that no longer describes the product are both wrong to leave in place,
because the next reader cannot tell them from the ones that are still true. Deleting them is worse: the
question "why did we do it that way" comes back, and the answer was in the file somebody removed.

So they move here, and this folder is the one place in `docs/` that is read backwards.

## 🗂️ Structure

The file keeps its name, `YYYY-MM-DD-<topic>.md`, so `git log --follow` still finds its history, and its
frontmatter gains the tag `archived`.

```md
---
tags: [spec, archived]
aliases: [Invite a teammate]
---

> [!NOTE]
> Archived on 2026-06-02. Superseded by [the team roles spec](../specs/2026-06-02-team-roles.md).

# Invite a teammate
```

The alert at the top is the whole convention: **the date it was archived, and what replaced it**, or one line
saying it was abandoned and why. A file here without that line is indistinguishable from a file that was
filed in the wrong folder.

## 🚀 Usage

```bash
git mv docs/plans/2026-04-08-billing-rollout.md docs/archive/
```

Then add the alert, add `archived` to its `tags`, and remove its row from the index it was listed in. All of
that goes in one commit, and it is the last commit of the work the document described.

## 🧩 Extending

- **Archive, never rewrite.** Correcting an archived document turns a record of what was believed into a
  record of nothing.
- **A decision is not archived.** An ADR that stops being true is marked `superseded` and stays in
  [`../adr/`](../adr/README.md), because the numbering is what other documents point at.
- **A convention is not archived either.** It is changed, and the change is the record.
- **Nothing is archived while it is still the best description of the system.** An old date is not a reason.

## 🔗 Related

- [Specs](../specs/README.md): where a spec lives while it is still true
- [Plans](../plans/README.md): where a plan lives until it is carried out
- [Decisions](../adr/README.md): what happens instead when a decision stops holding
