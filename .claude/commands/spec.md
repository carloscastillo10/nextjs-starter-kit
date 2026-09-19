---
description: Write or amend the spec a feature is built against, before its issue exists
argument-hint: "<the capability to specify, or the spec to amend>"
allowed-tools: Read, Grep, Glob, Edit, Write, Skill, Bash(git status:*), Bash(git diff:*), Bash(git switch:*)
---

# Spec

Behavior is decided here and nowhere else. Step 0 of the flow in `CONTRIBUTING.md`, and the only step whose output is a source of truth rather than a consequence of one.

Target: `$ARGUMENTS` — a capability that needs specifying, or a spec in `docs/specs/` to amend.

**Needs:** nothing but the repository. It writes one file and leaves it for a pull request.

## Most of the time this should not run

A change whose behavior is already written down, or self-evident, goes straight to `/feature`: a dependency bump, a bug with a failing test, a component the design already describes. Say so and point at the file that already answers it.

Run this when one of these is true, and say which:

- Nothing written down says how the product should behave here.
- What is written is **wrong**, because reality turned out different.
- The work needs a decision nobody has taken, and taking it inside a feature branch buries it.

## Read before writing

Each of these is skipped with a one-line note when it does not exist yet, never treated as an error.

1. `docs/architecture/` — the system as it is, starting with the Feature-Sliced Design guide. A spec that needs a different shape says so out loud instead of specifying around it.
2. `docs/business-rules.md` — the rules that cross features. A spec that restates one has forked it; link to the `BR-xx` id instead.
3. `docs/adr/` — decisions already taken and what they rejected. A spec that contradicts one names the ADR it contradicts.
4. `docs/conventions/` and `DESIGN.md` — how code here is written, and the visual language a screen inherits.
5. The existing spec when amending, and anything in `docs/specs/` that depends on it.

## Draft it with the brainstorming skill

Use `superpowers:brainstorming`: this step is the design conversation, and its job is to surface the questions rather than settle them quietly.

**A question only the product owner can answer belongs in `## Open questions`, named as open.** Resolving one by inference, however obvious the answer looks, is what makes a spec untrustworthy six weeks later.

## The file

`docs/specs/YYYY-MM-DD-<slug>.md`, with the frontmatter every document under `docs/` carries:

```yaml
---
tags: [spec]
aliases: []
---
```

Then the sections, in this order:

```text
# Title
## Purpose          — what this is for, and who it is for
## Behavior         — what the product does, observably
## Out of scope     — what a reader will assume is included and is not
## Open questions   — named as open, never resolved by inference
## Acceptance criteria — observable, one per line, the issue copies them
```

Amending one, edit in place and keep the voice around it. A spec that deliberately differs from this list is not restructured to match.

## Then hand it over

Show the diff and **wait for approval**. A spec change is its own pull request, typed `docs`, and it merges **before** the issue that implements it exists: implementing against a spec that does not exist is drift on day one.

Run `/doc-review` on it before opening that pull request — a spec is where a contradiction with a business rule or a stale index shows up first.

When it merges, the next step is `/feature` against the section just written.
