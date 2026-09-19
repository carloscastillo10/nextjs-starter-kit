---
description: Run the documentation drift lens over the current changes or a pull request
argument-hint: "[pull request number | base ref]  (default: the changes against main)"
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git log:*), Bash(gh pr diff:*), Bash(gh pr view:*), Read, Grep, Glob, Task
---

# Doc review

Run a **documentation drift review** with the `doc-steward` agent. One of the two lenses `/ship` runs; the other is `code-steward`, over the same diff.

Target: `$ARGUMENTS` —

- a **number** → that pull request (`gh pr diff <n>`, `gh pr view <n>`)
- a **git ref** → `git diff <ref>...HEAD`
- **empty** → committed and uncommitted work against `main` (`git diff main...HEAD`, plus `git status` for the working tree)

## Steps

1. Resolve the target and collect the diff with the list of changed files.
2. Launch `doc-steward` with both, and ask for every drift check it holds, against the written record below.
3. Relay its report. **Do not apply any documentation edit** without confirmation; with it, have `doc-steward` make the smallest change that fixes the drift.

## What the drift is measured against

Each of these is checked when it exists and **skipped with a one-line note when it does not**, never treated as an error.

| Where | What drift looks like there |
| --- | --- |
| `docs/business-rules.md` | A change that contradicts a `BR-xx` rule, or implements one nobody wrote down |
| `docs/specs/` | The behavior shipped is not the behavior the spec describes, or its `## Open questions` were answered in code |
| `docs/adr/` | A decision taken in this diff that an ADR already settled differently, or one that needs an ADR and has none |
| `docs/conventions/` | Code that contradicts a written convention, or a convention the change silently changed |
| `docs/architecture/` | The system moved and the description of it did not |
| `DESIGN.md` | Tokens or theme usage changed in the stylesheet and not in the document that describes them |
| `Home.md`, `docs/README.md`, any index | A new document nothing links to, or an index entry pointing at something that moved |
| Workspace `README.md` files | A command, a script or a folder that no longer matches what the README says |
| Links | A relative link that no longer resolves, in either direction |

**`doc-steward` lives in `.claude/agents/`.** When it is not there, say so in one line, name what would have been checked, and stop: the lens reports as not run rather than as clean.
