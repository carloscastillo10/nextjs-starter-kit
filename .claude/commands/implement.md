---
description: Build the slice an issue describes, layer by layer, with the skills loaded
argument-hint: "[issue number]  (default: the number in the branch name)"
allowed-tools: Read, Grep, Glob, Edit, Write, Bash, Skill, Task
---

# Implement

Build what the issue promises and nothing else. Step 3 of the flow in `CONTRIBUTING.md`, between `/feature` and `/ship`.

Issue: `$ARGUMENTS`, or the number in the branch name when empty.

**Needs:** `gh` authenticated, to read the issue. Nothing else.

## 1. Refuse to start on a bad ticket

Read it with `gh issue view <n> --comments`. **Stop and report** rather than filling the gap yourself when any of these is true:

- It has no acceptance criteria, or they are not observable. Run `/feature` first.
- It has no vertical slice. Same.
- It names a blocker that is still open.

**Read what the issue cites and compare.** When the issue asks for behavior the spec does not describe, or contradicts it, **stop there**: do not reconcile them by writing code, and do not edit the spec to fit. Behavior is decided in `/spec`, in its own pull request. Say precisely where the two disagree.

## 2. Load the skills before the first line

The issue names them. Load each one — they are the rules that hold while the code is written, and loading them after review is loading them too late. When the issue names none, take them from `.claude/skills/README.md`; a hook names the ones a path needs as each file is written, which is a reminder rather than a substitute.

## 3. Work the layers in order

```text
packages/ui        the kit, when a primitive is missing
  → shared         infrastructure with no business rules
    → entities     domain models several slices agree on
      → features   complete user actions
        → widgets  only when several pages render the same block
          → _pages the screen, where most of the code belongs
            → app/ the route file, a re-export and nothing more
```

**One layer at a time, and its tests pass before the next starts.** The order is what keeps the dependency rule intact: every layer compiles against something that already exists, and nothing outward is reached from inward. `docs/architecture/feature-sliced-design.md` is the full statement of it, including why `widgets` is discouraged and why most screens need neither it nor `entities`.

A layer the slice does not reach is skipped out loud, not silently.

**Test behavior, not wiring.** A test that asserts a component rendered its own props back proves nothing; a test that asserts what a user can observe survives the next refactor. `docs/conventions/` holds the rest.

Two rules that outrank finishing:

- **Never widen the scope.** Something worth doing that the issue did not ask for is a new issue. Say it; do not build it.
- **Never invent an answer.** A behavior nobody verified, a rule nobody wrote, a field that might exist — those stop the work and get reported. A guess here becomes a type, then a screen.

## 4. Keep the plan where it belongs

The issue carries the plan for this work. A plan long enough to need its own document is written with `superpowers:writing-plans` into `docs/plans/`; a design that outlives the feature goes to `docs/specs/`; a decision that is hard to reverse becomes an ADR in `docs/adr/`. **Never `docs/architecture/`**: that folder describes the system as it is, a plan describes one that does not exist yet, and mixing them manufactures exactly the drift this flow exists to prevent.

## 5. Report against the promises, not against the diff

For each acceptance criterion, name the evidence: the test that covers it, or the command and what it printed. A criterion with no evidence is reported as not met. Do not soften that.

Stage the work by path and **hand the commit messages over without committing.** One commit per layer reads well and reverts cleanly, and each one waits for approval.

Then run `/ship`.
