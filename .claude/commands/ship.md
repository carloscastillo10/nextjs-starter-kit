---
description: Run every gate, prove the acceptance criteria, and open the pull request into main
argument-hint: "[issue number]  (default: the number in the branch name)"
allowed-tools: Read, Grep, Glob, Bash, Task
---

# Ship

Take a finished branch through the gates and into a pull request. Steps 4 to 6 of the flow in `CONTRIBUTING.md`. It does not write features and it does not merge.

Issue: `$ARGUMENTS`, or the number in the branch name when empty.

**Needs:** `gh` authenticated, to read the issue and open the pull request.

## 1. Know what was promised

Read the issue with `gh issue view <n> --comments`. Its acceptance criteria are the definition of done, not the diff. Keep the list; every one of them gets an answer at step 5.

## 2. Run the gates and read the output

```bash
pnpm gates
```

**One command, and it is not a list.** It reads the `Checks` job out of `.github/workflows/ci.yml` and runs what CI runs, so a gate added there is run here without this file changing. A list written down twice is how a branch passes six gates and fails a seventh in CI.

It keeps going after a failure, the way CI does, and says which failed at the end. **A gate that fails is the work, not a note in the report.** Fix it and run it again; stop and ask only when the fix would change behavior the issue did not ask for.

## 3. Run the two lenses

Both read the same diff and neither can do the other's job, so **run them in parallel**. Neither is optional.

- **`/doc-review`** against `main` — the documentation lens, which drives the `doc-steward` agent and reports where this change leaves the written record contradicted or stale.
- **`code-steward`** over the same diff — the code lens, for what a linter structurally cannot see: comments that restate the code, tests that assert wiring instead of behavior, scope the issue never asked for, a rule implemented in a component instead of the layer that owns it, an abstraction with one caller.

For each finding say which happened: **fixed here, or filed as an issue.** Nothing is silently accepted.

An agent that does not exist in `.claude/agents/` yet is reported as not run, in one line, with what it would have covered — never quietly skipped and never claimed.

Check the one thing neither lens covers: a `README.md` this change outdated. Updating it belongs to this branch.

## 4. Record what the branch learned

`/doc-review` reads the diff, so it only catches a fact that already reached a file. **The expensive facts are the ones still only in your head** — an API that does not behave the way the guide says, an answer that finally arrived, a trap that ate an afternoon. Nothing mechanical will ever find those, and this is the only step where they get written down.

Each finding has exactly one destination:

| What was learned | Where it goes |
| --- | --- |
| A rule that holds across features | [`docs/business-rules.md`](../../docs/business-rules.md), as a new `BR-xx` |
| A third party behaves differently from its own documentation | `docs/integrations/<name>.md`, **with the date and the URL** |
| A choice that is hard to reverse | [`docs/adr/`](../../docs/adr/README.md), as a new decision |
| How code here is written, now settled | [`docs/conventions/`](../../docs/conventions/README.md) |
| The system changed shape | [`docs/architecture/`](../../docs/architecture/README.md) |
| The spec was wrong or silent | the spec in [`docs/specs/`](../../docs/specs/README.md), including its `## Open questions` |
| A token, or how the theme is meant to be used | [`DESIGN.md`](../../DESIGN.md), alongside the stylesheet it describes |
| How a workspace is used or run | that workspace's `README.md` |

A folder that does not exist yet is named in the report as the place the finding belongs, rather than dropped.

**An answer somebody gave in conversation is not documentation.** Record who said it and when, and mark it unverified until it appears in a published reference.

Report this as a list in the pull request, and write **"nothing new"** explicitly when the branch genuinely taught nothing. An empty section reads as a step that was skipped.

## 5. Prove each acceptance criterion

One line per criterion, each naming the evidence: the test that covers it, the command and what it printed, or what appeared on the screen. A criterion with no evidence is reported as not met. Do not soften it.

## 6. Stage, and hand the commit message over

Stage by path and **print the commit message for approval without committing.** Never commit unasked. `git add <directory>` is not used here: a directory add sweeps in files that were deliberately left out.

```text
type(scope): <gitmoji> Message
```

Scope required, 50 characters or fewer, gitmoji after the colon, imperative verb in upper case, none of ``( ) , - ' " ` ;``, no final period, no trailers. The same gate the hook runs answers before the commit does:

```bash
printf '%s\n' "<subject>" | pnpm exec commitlint
```

## 7. Open the pull request, after confirmation

The title is the commit subject, because the merge is a squash, so it passes the same gate. The body follows `.github/pull_request_template.md`, four sections and the checklist.

```bash
gh pr create --base main --title "<subject>" --body-file <file>
```

**Write `Closes #<n>` in the body** when an issue exists. It closes the issue on merge, and `assign-on-open.yml` reads the same keyword to give that issue an owner, which GitHub does not do by itself; leaving the number off costs both.

Report the pull request URL, the state of every gate, what each lens found and where it went, and anything left undone. If CI comes back red, say what failed rather than that the pull request was opened.
