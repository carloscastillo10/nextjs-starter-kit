---
description: Turn a spec into a ready issue, then a branch linked to it
argument-hint: "<issue number, or what the work is>  (e.g. 42, or the settings page)"
allowed-tools: Read, Grep, Glob, Bash(gh issue:*), Bash(gh auth status:*), Bash(git fetch:*), Bash(git worktree:*), Bash(printf:*), Bash(pnpm exec commitlint:*), Skill
---

# Feature

Open one unit of work with everything a second person needs to build it without asking. Step 1 of the flow in `CONTRIBUTING.md`.

Target: `$ARGUMENTS` — **an issue number** when the ticket already exists, or a description of the work when it does not.

**Needs:** `gh` authenticated (`gh auth status`) and issues enabled on the remote. The labels in `.github/labels.yml` should exist; a form that names one that does not apply it silently, so say so rather than assuming it stuck.

**Most of the time the ticket already exists** and it is thin: a title and a line. Then nothing is created — read it with `gh issue view <n> --comments`, check it against what is written down, and **fill it out** into the form below, leaving the original text and its author's intent intact. Report it as completed, not as replaced.

## Read before writing anything

Skip with a one-line note whatever does not exist yet.

1. The spec in `docs/specs/` this implements, including its `## Open questions` and `## Acceptance criteria`.
2. `docs/architecture/` — the layers the work will cut through, and what each may import.
3. `docs/business-rules.md` — the `BR-xx` ids this work has to obey.
4. `docs/adr/` — a decision this contradicts is named, not routed around.
5. `docs/conventions/` and `DESIGN.md` for anything that reaches a screen.

## Then decide whether it is ready

**Stop and report when the behavior is not written down anywhere and is not self-evident.** Say what is missing and which file it belongs in; `/spec` is its own pull request and it comes first. Do not invent the behavior into the issue.

Stop as well when the work is blocked on something no issue can unblock — a decision nobody has taken, a credential nobody has, an answer that has not arrived. Open the issue with the blocker written down and label it `needs-info`: an issue nobody can check off is not ready, and hiding that is what makes a board lie.

## Draft the issue

Match `.github/ISSUE_TEMPLATE/feature.yml` field for field:

- **What says this should exist** — the file and section, or "none needed" with the reason.
- **Scope** — what someone can do once this merges that they could not before. Not a list of files.
- **The vertical slice** — every layer it touches, empty where it does not reach: `shared`, `entities`, `features`, `widgets`, `_pages`, the route file, `packages/ui`, tests, docs.
- **Skills to load** — from the list the form offers. Write them into the issue: implementation usually happens in a later session with none of this context, and a skill named in the ticket loads itself the moment somebody reads it.
- **Acceptance criteria** — observable, one per line, each checkable by a reviewer. `/ship` answers them one by one with evidence.
- **Out of scope**, and **Blocked or unverified** from the step above.

**The issue carries the plan, and the plan dies with the pull request.** Anything longer-lived has somewhere else to live, and `CONTRIBUTING.md` has the table: a multi-task plan written with `superpowers:writing-plans` goes to `docs/plans/`, a design that outlives the feature to `docs/specs/`, a decision that is hard to reverse to `docs/adr/`. Never to `docs/architecture/`, which describes the system as it is.

## Hand it over

Show the full drafted body and **wait for confirmation.** Only then:

```bash
gh issue edit <n> --body-file <file>
gh issue create --title "<type>(<scope>): <gitmoji> <imperative message>" --body-file <file>
```

**The title is already a commit subject, so write it as one.** `/ship` makes it the pull request title and the squash merge makes that the commit on `main`, judged by the same gate at both ends. The rules are in `CONTRIBUTING.md` under *Commits*; the two a "what someone can do" phrasing trips hardest are that **the scope is required** and that **the first word is an imperative verb**, so `Added`, `Adding` and openers such as `The` or `New` are all refused.

**Run the gate rather than trusting the rules from memory:**

```bash
printf '%s\n' "<title>" | pnpm exec commitlint
```

## Offer the branch

After the issue exists, offer both and let the person pick:

1. **Same tree** — `gh issue develop <n> --name <type>/<n>-<slug> --base main --checkout`
2. **A worktree**, to leave the current tree untouched — the same command without `--checkout`, then:

   ```bash
   git fetch origin
   git worktree add .claude/worktrees/<slug> <type>/<n>-<slug>
   ```

   **The fetch is not optional.** `gh issue develop` creates the branch through the API, on the remote; without `--checkout` nothing local knows it exists, and `git worktree add` fails with `invalid reference` until a fetch has written the tracking ref.

**`gh issue develop`, never `git switch -c`,** whenever there is an issue: only the first registers the branch against it, which is what fills the issue's Development section and tells anyone looking that the work has started. The second produces a branch whose name merely contains a number. `pre-push` refuses the first push of an issue branch that GitHub never linked, which is the last moment the mistake is cheap.

Report the issue URL and the branch, and stop there. Building is the next command.
