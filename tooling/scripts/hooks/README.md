# 🪝 Claude Code hooks

> Scripts that Claude Code runs around its own tool calls, so a convention reaches an agent while it writes, not at commit time.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [The skill reminder](#the-skill-reminder)
  - [Declaring a hook](#declaring-a-hook)
  - [Trying a hook by hand](#trying-a-hook-by-hand)
  - [Two things that will bite](#two-things-that-will-bite)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

`CLAUDE.md` is advice, and it fades over a long session. A skill loads only when the agent decides to load it. lefthook is deterministic, but it speaks at commit and push, after the code exists. A hook declared in [`.claude/settings.json`](../../../.claude/settings.json) runs on every matching tool call, in every session, for everyone who opens the repository, because that file is committed.

## 🗂️ Structure

| File                | Holds                                                                                                             |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `skill-rules.mjs`   | The rules of the skill reminder: which skills govern a path, and whether the comment rule applies. No I/O         |
| `remind-skills.mjs` | The skill reminder hook: reads the tool call from stdin, remembers what the session has seen, prints the reminder |
| `*.test.mjs`        | Tests: the rules directly, the hook as a real process against a temporary project                                 |

Hooks declared in `.claude/settings.json`:

| Script              | Event        | Matcher       | Behavior                                                                                            |
| ------------------- | ------------ | ------------- | --------------------------------------------------------------------------------------------------- |
| `remind-skills.mjs` | `PreToolUse` | `Write\|Edit` | Names the skills that govern the file and, on a source file, the comment rule. Never blocks a write |

## 🚀 Usage

### The skill reminder

Before Claude writes or edits a file, `remind-skills.mjs` adds a note to its context. For a component it reads like this (shortened):

```text
You are about to write apps/web/src/_pages/home/ui/HomePage.tsx.

Load `feature-sliced-design`, `vercel-react-best-practices`, and `vercel-composition-patterns`
before you continue, unless they are already loaded: the layer decides what a component may
import, and render cost and prop design are cheaper to get right now than in review. …

**Comments explain why, never what** (docs/conventions/comments.md). …

Each reminder above appears once per session.
```

#### Rules, first match wins

| Rule         | Paths                                                                         | Skills                                                                                |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `design-md`  | `DESIGN.md`                                                                   | `design-md`                                                                           |
| `prose`      | Any other Markdown file                                                       | `stop-slop`                                                                           |
| `monorepo`   | `package.json` and `turbo.json` at any level, `pnpm-workspace.yaml`, `turbo/` | `turborepo`                                                                           |
| `theme`      | `tooling/tailwind/`                                                           | `tailwind-css`, `design-md`                                                           |
| `ui-kit`     | `packages/ui/`, any `components.json`                                         | `shadcn`, `tailwind-css`                                                              |
| `stylesheet` | Any other `.css` file                                                         | `tailwind-css`                                                                        |
| `route-file` | `apps/*/app/`                                                                 | `feature-sliced-design`, `vercel-react-best-practices`                                |
| `app-ui`     | `.jsx` and `.tsx` files under `apps/*/src/`                                   | `feature-sliced-design`, `vercel-react-best-practices`, `vercel-composition-patterns` |
| `app-code`   | Anything else under `apps/*/src/`                                             | `feature-sliced-design`, `vercel-react-best-practices`                                |

**Order is the design.** The rules run from narrow to wide, and the first one that matches is the only one that speaks, so `packages/ui/README.md` gets the prose rule and `packages/ui/package.json` gets the monorepo rule. Paths are read from the root of the checkout that holds the file, so a worktree nested inside the project resolves the same way. Nothing fires for `.claude/skills/`, `.agents/` or `node_modules/`: nobody writes those by hand.

**The comment rule** comes with every source file the [comment check](../README.md#the-comment-check) covers, whether a skill rule matched or not. A skill has to be loaded to be obeyed, and the comment convention is the one most often broken by whoever did not load one.

**Once per session, per reminder.** The hook leaves an empty marker file for each reminder it gives, under `claude-skill-reminders/<session>/` in the system temporary folder, and stays silent about a reminder the session already had. Without that, the same paragraphs would land on every edit of a file, which is how a useful hook becomes one people switch off. The skill rule and the comment rule are tracked apart, so moving on to a file under another rule brings only the new rule.

> [!NOTE]
> A rule names only skills vendored in [`.claude/skills/`](../../../.claude/skills/README.md), never a plugin: a fresh clone has every vendored skill, while a plugin may not be installed yet. A test fails when a rule names a skill with no folder there, so removing a skill means removing it from the rules too.

### Declaring a hook

Each script is one entry in the array of its event, with its own matcher:

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "node",
      "args": ["${CLAUDE_PROJECT_DIR}/tooling/scripts/hooks/<script>.mjs"],
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
  | node tooling/scripts/hooks/remind-skills.mjs
```

The `additionalContext` in the output is what Claude receives. Run the same line again and it prints nothing, because session `try-1` already had both reminders; change the `session_id` to see them again. Silence with exit code `0` always means the hook let the call through.

### Two things that will bite

- **Success is invisible.** Claude Code mentions a hook only when it fails or runs slowly, and `additionalContext` goes to Claude, not to the screen. To see the hook fire, run Claude Code with `--debug hooks`, or look for the marker files.
- **A settings change may not reach a running session.** If an edit to `.claude/settings.json` seems to have no effect, open `/hooks` to see what the session loaded, or start a new session.

## ⌨️ Commands

| Command                                                            | What it does                                    |
| ------------------------------------------------------------------ | ----------------------------------------------- |
| `pnpm --filter @repo/scripts test`                                 | Runs the hook tests with the other script tests |
| `echo '<payload>' \| node tooling/scripts/hooks/remind-skills.mjs` | Runs the skill reminder on one payload          |

## 🧩 Extending

- **A new skill rule** is an `id`, a `when` pattern on the path from the repository root, the `skills` it names and a `why` that completes the sentence "Load … before you continue, unless … already loaded: …". Place it above any wider rule that would also match, add its row to the table above (a test compares the two), and give it cases in `skill-rules.test.mjs`.
- **A `Write|Edit` hook never blocks.** A refused write reads as a broken tool rather than wrong content, and an agent that cannot write a file cannot fix it either. lefthook is still the wall at commit time; these hooks are the handrail before it.
- **A hook does not repeat a lefthook job.** Formatting and the commit message checks already run on staged files, and running them on every write slows each one down for nothing.

## 🔗 Related

- [Project skills](../../../.claude/skills/README.md): what each skill covers and where it comes from
- [Comment conventions](../../../docs/conventions/comments.md)
- [@repo/scripts](../README.md): the checks lefthook and CI run
- [Hooks reference](https://code.claude.com/docs/en/hooks) in the Claude Code docs
