# 🪝 Claude Code hooks

> Scripts that Claude Code runs around its own tool calls, so a convention reaches an agent while it writes, not at commit time.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [The skill reminder](#the-skill-reminder)
  - [The graph hint](#the-graph-hint)
  - [The shell guard](#the-shell-guard)
  - [The check of a written file](#the-check-of-a-written-file)
  - [Declaring a hook](#declaring-a-hook)
  - [Trying a hook by hand](#trying-a-hook-by-hand)
  - [Two things that will bite](#two-things-that-will-bite)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

`CLAUDE.md` is advice, and it fades over a long session. A skill loads only when the agent decides to load it. lefthook is deterministic, but it speaks at commit and push, after the code exists. A hook declared in [`.claude/settings.json`](../../../.claude/settings.json) runs on every matching tool call, in every session, for everyone who opens the repository, because that file is committed.

## 🗂️ Structure

| File                     | Holds                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| `skill-rules.mjs`        | The rules of the skill reminder: which skills govern a path, and whether the comment rule applies. No I/O          |
| `remind-skills.mjs`      | The skill reminder hook: reads the tool call from stdin, remembers what the session has seen, prints the reminder  |
| `guard-bash.mjs`         | The shell guard: refuses a command that skips the hooks or pushes to `main`, and hands over the pull request rules |
| `check-written-file.mjs` | The check of a written file: runs the linters that cover it and hands back what they said                          |
| `*.test.mjs`             | Tests: the rules directly, the hook as a real process against a temporary project                                  |

Hooks declared in `.claude/settings.json`:

| Script                                                     | Event         | Matcher            | Behavior                                                                                            |
| ---------------------------------------------------------- | ------------- | ------------------ | --------------------------------------------------------------------------------------------------- |
| `remind-skills.mjs`                                        | `PreToolUse`  | `Write\|Edit`      | Names the skills that govern the file and, on a source file, the comment rule. Never blocks a write |
| [`../graphify/graph-hint.mjs`](../graphify/graph-hint.mjs) | `PreToolUse`  | `Bash\|Grep\|Glob` | Before a search, points at the code graph when one has been built. Never blocks a search            |
| `guard-bash.mjs`                                           | `PreToolUse`  | `Bash`             | Blocks a command that skips a git hook or pushes to `main`; on `gh pr create`, injects the rules    |
| `check-written-file.mjs`                                   | `PostToolUse` | `Write\|Edit`      | Runs the linters that cover the file just written and hands back what they said. Never blocks       |

## 🚀 Usage

### The skill reminder

Before Claude writes or edits a file, `remind-skills.mjs` adds a note to its context. For a component it reads like this (shortened):

```text
You are about to write apps/web/src/_pages/home/ui/HomePage.tsx.

Load `project-conventions`, `feature-sliced-design`, `vercel-react-best-practices`, and
`vercel-composition-patterns` before you continue, unless they are already loaded: the layer
decides what a component may import, the standard decides where its state and handlers live,
and render cost and prop design are cheaper to get right now than in review. …

**Comments explain why, never what** (docs/conventions/comments.md). …

Each reminder above appears once per session.
```

#### Rules, first match wins

| Rule           | Paths                                                                         | Skills                                                                                                       |
| -------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `design-md`    | `DESIGN.md`                                                                   | `design-md`                                                                                                  |
| `prose`        | Any other Markdown file                                                       | `stop-slop`                                                                                                  |
| `monorepo`     | `package.json` and `turbo.json` at any level, `pnpm-workspace.yaml`, `turbo/` | `turborepo`                                                                                                  |
| `theme`        | The stylesheets in `tooling/tailwind/`                                        | `tailwind-css`, `design-md`                                                                                  |
| `theme-config` | Anything else in `tooling/tailwind/`                                          | `project-conventions`, `tailwind-css`                                                                        |
| `ui-kit`       | `packages/ui/`, any `components.json`                                         | `project-conventions`, `shadcn`, `tailwind-css`                                                              |
| `stylesheet`   | Any other `.css` file                                                         | `tailwind-css`                                                                                               |
| `route-file`   | `apps/*/app/`                                                                 | `project-conventions`, `feature-sliced-design`, `vercel-react-best-practices`                                |
| `app-ui`       | `.jsx` and `.tsx` files under `apps/*/src/`                                   | `project-conventions`, `feature-sliced-design`, `vercel-react-best-practices`, `vercel-composition-patterns` |
| `app-code`     | Anything else under `apps/*/src/`                                             | `project-conventions`, `feature-sliced-design`, `vercel-react-best-practices`                                |
| `source`       | Any other TypeScript or JavaScript file, in any workspace                     | `project-conventions`                                                                                        |

**Order is the design.** The rules run from narrow to wide, and the first one that matches is the only one that speaks, so `packages/ui/README.md` gets the prose rule and `packages/ui/package.json` gets the monorepo rule. The last rule is the widest: the code standard holds in every workspace, so a script in `tooling/` hears about it too. Paths are read from the root of the checkout that holds the file, so a worktree nested inside the project resolves the same way. Nothing fires for `.claude/skills/`, `.agents/`, `node_modules/` or build output (`dist/`, `build/`, `coverage/`, `.next/`, `.turbo/`, `*.d.ts`): nobody writes those by hand.

**The comment rule** comes with every source file the [comment check](../comments/README.md#the-comment-check) covers, whether a skill rule matched or not. A skill has to be loaded to be obeyed, and the comment convention is the one most often broken by whoever did not load one.

**Once per session, per reminder.** The hook leaves an empty marker file for each reminder it gives, under `claude-skill-reminders/<session>/` in the system temporary folder, and stays silent about a reminder the session already had. Without that, the same paragraphs would land on every edit of a file, which is how a useful hook becomes one people switch off. The skill rule and the comment rule are tracked apart, so moving on to a file under another rule brings only the new rule.

> [!NOTE]
> A rule names only skills that live in [`.claude/skills/`](../../../.claude/skills/README.md), vendored or written here, never a plugin: a fresh clone has every one of them, while a plugin may not be installed yet. A test fails when a rule names a skill with no folder there, so removing a skill means removing it from the rules too.

### The graph hint

Before a search, `graph-hint.mjs` says that the [code graph](../../../docs/knowledge/README.md) can answer the question without reading the files:

```text
A code graph of this repository is in .graphify/, rebuilt after each commit, branch checkout,
merge and rebase. Before searching the files, read .graphify/GRAPH_REPORT.md for the most
connected symbols and the communities, or ask the graph: `graphify query "<question>"` …
```

It speaks only when `.graphify/GRAPH_REPORT.md` exists in the checkout that holds the working folder, so a clone where nobody installed graphify never hears about it, and only once per session, like the skill reminder. In Bash it looks for a search program in command position (`grep`, `rg`, `find`, `fd`, `ack`, `ag`, `git grep`), so `git log --grep=x` does not count; the `Grep` and `Glob` tools always do. The script lives with the other graph scripts rather than in this folder, because it changes with them.

### The shell guard

`guard-bash.mjs` is the one hook here that blocks, and it blocks two things:

| Command                                                                     | What happens                                                                                    |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `--no-verify`, `git commit -n`, `LEFTHOOK=0` or `LEFTHOOK=false`            | Denied. `LEFTHOOK_EXCLUDE=<job>` still works, so a single job, such as `graph`, can be left out |
| A `git push` that lands on `main`, named or by being the checked-out branch | Denied, with the pull request as the way in                                                     |

The rest is not a block. On `gh pr create` it hands back the four sections of the pull request template, the rule the title has to pass, and what [`check-branch-scope`](../git/README.md#the-branch-checks) makes of the branch:

```text
  This branch against origin/main:

      ! This branch changes 2 unrelated things, so a reviewer has to switch context …

  Split it now if it should be split: a branch is cheap to divide and a pull request is
  not. …
```

**A branch is cheap to split and a pull request is not**, so the scope report runs here as well as in `pre-push`: opening the pull request is the last moment the cheap answer is still available. It reports and never denies, because a scaffold, a generated drop and a repository-wide rename are all legitimately enormous and nothing mechanical tells them from a branch that quietly grew a second subject.

Two things it deliberately gets wrong in the safe direction. It **reads the text of the command, not a parsed shell**, so `--no-verify` inside a quoted commit message is refused too: writing that sentence into a file, where it belongs, still works, and the body of a heredoc is skipped for exactly that reason. And a `git push` whose flags take separate values can be read as a push of a branch it names; erring toward the denial costs a rephrase, while the opposite costs a commit on `main`.

**The escape hatches stay open for a person.** `CONTRIBUTING.md` explains when skipping a hook is reasonable, and none of that changes: the guard only runs inside a Claude Code session, where the honest move is to fix what the hook reported.

### The check of a written file

After Claude writes or edits a file, `check-written-file.mjs` runs the checks that cover that extension and hands back what they said:

| Extension                            | Checks                                                       |
| ------------------------------------ | ------------------------------------------------------------ |
| `.ts`, `.tsx`, `.js`, `.mjs` and kin | ESLint, Prettier, cspell, and the comment check              |
| `.md`                                | markdownlint, the frontmatter check, Prettier, cspell        |
| `.css`, `.json`, `.yml` and kin      | Prettier, cspell                                             |
| Anything else                        | Prettier, which decides for itself whether it knows the file |

**This is the one hook that repeats work lefthook already does**, and it repeats it on purpose. The same report costs nothing at the moment the file is open and the reason for writing it that way is still in context; at commit time it costs a second trip through the file and a fresh reading of why it looked like that. A check missing from `node_modules` is skipped rather than reported, so a fresh clone before `pnpm install` stays quiet, and a file git is told to ignore is left alone: it belongs to a tool or to one person, not to the repository.

The comment check reports either way, because its density and length findings are judgement to weigh rather than rules to obey, and they never reach the agent through an exit code.

### Declaring a hook

Each script is one entry in the array of its event, with its own matcher:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node",
      "args": ["${CLAUDE_PROJECT_DIR}/tooling/scripts/claude-hooks/<script>.mjs"],
      "timeout": 10,
      "statusMessage": "What the spinner says while the hook runs"
    }
  ]
}
```

- **Add an entry of your own** instead of appending to the `hooks` list of another script, so each hook can change or go away without touching the others.
- **Order means nothing.** Claude Code runs every matching hook in parallel, so one hook cannot count on another having run first.
- **`command` plus `args` is the exec form.** No shell parses it, so the project path needs no quotes and the same entry works on Windows. `${CLAUDE_PROJECT_DIR}` is the project root, wherever the session's working directory has moved.
- **`timeout` is in seconds.**

### Trying a hook by hand

A hook reads its payload as JSON on stdin, so pipe one in:

```bash
echo '{"session_id":"try-1","tool_name":"Write","tool_input":{"file_path":"'"$PWD"'/apps/web/src/_pages/home/ui/HomePage.tsx"}}' \
  | node tooling/scripts/claude-hooks/remind-skills.mjs
```

The `additionalContext` in the output is what Claude receives. Run the same line again and it prints nothing, because session `try-1` already had both reminders; change the `session_id` to see them again. Silence with exit code `0` always means the hook let the call through.

### Two things that will bite

- **Success is invisible.** Claude Code mentions a hook only when it fails or runs slowly, and `additionalContext` goes to Claude, not to the screen. To see the hook fire, run Claude Code with `--debug hooks`, or look for the marker files.
- **A settings change may not reach a running session.** If an edit to `.claude/settings.json` seems to have no effect, open `/hooks` to see what the session loaded, or start a new session.

## ⌨️ Commands

| Command                                                                        | What it does                                    |
| ------------------------------------------------------------------------------ | ----------------------------------------------- |
| `pnpm --filter @repo/scripts test`                                             | Runs the hook tests with the other script tests |
| `echo '<payload>' \| node tooling/scripts/claude-hooks/remind-skills.mjs`      | Runs the skill reminder on one payload          |
| `echo '<payload>' \| node tooling/scripts/graphify/graph-hint.mjs`             | Runs the graph hint on one payload              |
| `echo '<payload>' \| node tooling/scripts/claude-hooks/guard-bash.mjs`         | Runs the shell guard on one payload             |
| `echo '<payload>' \| node tooling/scripts/claude-hooks/check-written-file.mjs` | Runs the file check on one payload              |

## 🧩 Extending

- **A new skill rule** is an `id`, a `when` pattern on the path from the repository root, the `skills` it names and a `why` that completes the sentence "Load … before you continue, unless … already loaded: …". Place it above any wider rule that would also match, add its row to the table above (a test compares the two), and give it cases in `skill-rules.test.mjs`.
- **A `Write|Edit` hook never blocks.** A refused write reads as a broken tool rather than wrong content, and an agent that cannot write a file cannot fix it either. lefthook is still the wall at commit time; these hooks are the handrail before it.
- **A hook repeats a lefthook job only where the earlier answer is worth the wall clock.** The check of a written file does, because a report lands while the file is still open. A check of the whole repository does not: it would pay for every file on every write.
- **Something worth blocking is worth denying with a way out.** The shell guard refuses two commands and each denial names what to do instead; a denial that only says no gets worked around, which is worse than not having it.

## 🔗 Related

- [Project skills](../../../.claude/skills/README.md): what each skill covers and where it comes from
- [Comment conventions](../../../docs/conventions/comments.md)
- [@repo/scripts](../README.md): the checks lefthook and CI run
- [Knowledge graph](../../../docs/knowledge/README.md): what the graph holds and when it is rebuilt
- [Hooks reference](https://code.claude.com/docs/en/hooks) in the Claude Code docs
