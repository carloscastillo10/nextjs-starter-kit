---
tags: [adr, git, workflow, ci]
aliases: [ADR 08, GitHub Flow and commit convention]
status: accepted
---

# GitHub Flow, squash merges, and a commit convention a hook enforces

`main` is the only long-lived branch. Work happens on a short branch named `<type>/<issue>-<slug>`, reaches
`main` through a pull request, and is **squashed** into a single commit whose subject is the pull request
title. Every subject has one shape, `type(scope): <gitmoji> Message`, at most 50 code points, and
[commitlint](../../commitlint.config.mjs) checks it in the `commit-msg` hook and again on the pull request
title in CI. No commit carries a `Co-authored-by` trailer: authorship belongs in the author field.

Squashing is what makes the convention affordable. Commits inside a branch are working notes, and holding
each of them to a 50-character imperative subject would be theatre; holding the one commit that survives to
it is not. The history of `main` is then a readable list of changes, one per pull request, which is what makes
`git log` a usable changelog.

## Considered options

**Git Flow, with `develop` and release branches.** Rejected: a template deploys from `main` and has no
release train. The extra branches would be ceremony with nothing behind them.

**Merge commits, keeping each branch's history.** Rejected: the convention would then have to hold for every
work-in-progress commit, or the history of `main` would mix conventional subjects with "wip" and "fix typo".

**A convention documented but not enforced.** Rejected because it is what everyone does and it never holds.
The rules live in [`tooling/scripts/git/commit-rules.mjs`](../../tooling/scripts/git/README.md), so the hook
and CI apply exactly the same ones.

## Consequences

- A branch is created with `gh issue develop`, so GitHub links it to its issue from the first moment; a
  `pre-push` check stops the first push of an issue branch that has no link.
- The gitmoji has to sit immediately after the colon, and an emoji with a variation selector counts as two
  code points against the 50.
- Messages git writes itself — merges, reverts, `fixup!` — skip the shape rules, because git chose that
  wording. The `Co-authored-by` rule is not one they skip.
- Squash merging, branch deletion and the required checks are repository settings, and settings do not travel
  with "Use this template". [`CONTRIBUTING.md`](../../CONTRIBUTING.md) carries the commands that apply them to
  a new repository.
