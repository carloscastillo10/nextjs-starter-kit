# 🌿 Git checks

> What a commit has to look like, who it may come from, and what a branch is allowed to carry.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [The commit convention](#the-commit-convention)
  - [Who a commit says it came from](#who-a-commit-says-it-came-from)
  - [The branch checks](#the-branch-checks)
  - [Fixing the staged files](#fixing-the-staged-files)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

These are the checks [lefthook](../../../lefthook.yml) runs around git itself: `commit-msg`, `pre-commit` and `pre-push`. They answer three questions no off-the-shelf tool answers for this repository — is the message shaped right, does the commit carry the right identity, and is the branch still about one thing.

## 🗂️ Structure

| File                        | Holds                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `commit-rules.mjs`          | The commit convention as commitlint rules, loaded by the root `commitlint.config.mjs`                              |
| `check-git-identity.mjs`    | `commit-msg`: refuses a commit that would not carry the global git identity                                        |
| `check-push-authors.mjs`    | `pre-push`: refuses a commit by an address that is neither the pusher's nor already on `origin/main`               |
| `check-author-identity.mjs` | CI, opt in: refuses a pull request with a commit whose author has no access to the repository                      |
| `check-linked-branch.mjs`   | `pre-push`: stops the first push of an issue branch that GitHub has not linked to its issue                        |
| `check-branch-scope.mjs`    | `pre-push`: reports a branch that mixes unrelated changes or is very large; `--strict` makes it fail               |
| `fix-staged.mjs`            | `pre-commit`: runs ESLint or Prettier in fix mode on fully staged files and in check mode on partially staged ones |
| `git-sandbox.mjs`           | Test helper: a temporary repository with its own global git config, and fake commands on its `PATH`                |

## 🚀 Usage

### The commit convention

```text
type(scope): <gitmoji> Message
```

[`CONTRIBUTING.md`](../../../CONTRIBUTING.md#commits) lists the rules for whoever writes a commit. This section is for whoever changes them. The root `commitlint.config.mjs` parses the header into `type`, `scope` and `subject`, then runs three built-in rules and the seven in `commit-rules.mjs`:

| Rule                         | Rejects                                                                                                  | Source             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------ |
| `type-enum`                  | A type outside `feat fix docs style refactor perf test build ci chore revert`                            | built in           |
| `header-shape`               | A header not shaped `type(scope):` plus a space: a missing or non-kebab scope, an upper case type, a `!` | `commit-rules.mjs` |
| `header-max-code-points`     | A first line over 50 code points                                                                         | `commit-rules.mjs` |
| `subject-gitmoji`            | A subject that does not open with an emoji or a `:code:`, then a space                                   | `commit-rules.mjs` |
| `subject-upper-first`        | A lower case first letter after the gitmoji                                                              | `commit-rules.mjs` |
| `subject-imperative`         | A first word such as `Added`, `Adding`, `Adds`, or an opener such as `The` or `New`                      | `commit-rules.mjs` |
| `subject-allowed-characters` | Any of ``( ) , - ' " ` ;`` in the message                                                                | `commit-rules.mjs` |
| `subject-full-stop`          | A final period                                                                                           | built in           |
| `body-leading-blank`         | A body that starts on the line after the subject                                                         | built in           |
| `no-co-authored-by`          | A `Co-authored-by` trailer, in any letter case                                                           | `commit-rules.mjs` |

Why it is built this way:

- **Length is counted in code points**, the way a person counts characters, so 🐛 costs one. An emoji written with a variation selector, such as ♻️ or ⚡️, is two code points and costs two.
- **Any emoji passes**, including sequences joined with a zero-width joiner such as 🧑‍💻. A fixed list of gitmoji would reject a good message the day the list grows.
- **The imperative check rejects forms instead of allowing verbs.** There are hundreds of good verbs, so a closed list would reject good messages; the past tense, the gerund and the third person of the common verbs, and openers that describe instead of instruct, are few.
- **commitlint's default ignores are off.** They skip every rule on a merge commit, which would let a `Co-authored-by` trailer in through a local merge. Instead, each shape rule passes a message git writes itself (`Merge …`, `Revert "…"`, `Reapply "…"`, `fixup!`, `squash!`, `amend!`), and `no-co-authored-by` still runs on it.
- **The trailer rule reads the parsed body**, not the raw message: with `git commit --verbose`, git appends the diff below a scissors line, and a `Co-authored-by` inside that diff is not a trailer.

The pull request title goes through the same config in CI, because a squash merge turns it into the commit on `main`.

### Who a commit says it came from

Two checks, because one question splits into two that are answered at different moments.

**`check-git-identity.mjs`, on `commit-msg`: is this commit about to carry the wrong name?** It compares the identity git would stamp, `git var GIT_AUTHOR_IDENT` and `GIT_COMMITTER_IDENT` (so environment variables and `git -c` count too), with `user.name` and `user.email` from the global config, and refuses the commit when they differ. It names the cause: a repository-level override, with the exact `git config --unset-all` commands; a `-c` on the command line; or the environment.

- **The global config is the reference, not a list of people.** A list of allowed addresses has to be edited every time someone joins, and the day it is forgotten it blocks a real developer. A new developer sets their global identity once, as everyone already does, and never sees this check.
- **A repository-level override is the case worth refusing.** Every worktree shares one config file, so `git config user.email` inside the repository silently reassigns authorship for every session on the machine, not for one commit.
- **It runs on `commit-msg`, not `pre-commit`.** lefthook skips every `pre-commit` job when nothing is staged, so an empty commit, a message-only amend or a merge would pass unchecked; `commit-msg` runs for every commit `git commit` and `git merge` create.
- **It skips itself when there is no global identity**, because a fresh machine has none, and a check that fires before setup is a check people switch off.

**`check-push-authors.mjs`, on `pre-push`: does a commit come from an address nobody here uses?** The commit check cannot see a commit made somewhere else and then rebased or cherry-picked into the branch. So this one looks at every commit the branch adds against `origin/main` and accepts an author address only if it is the pusher's global one, or if it already appears in the history of `origin/main`. The accepted set derives itself from git, so there is no file to keep: a new colleague passes on their first push, because it carries their own identity. Without a fetched `origin/main` it skips itself.

**`check-author-identity.mjs`, in CI on the pull request: does every commit belong to someone with access?** For each commit it asks GitHub which account owns the author's address, then whether that account is a collaborator on the repository. A commit whose address belongs to no account, or to an account without access, fails the check. No hook runs on a commit made in the GitHub web editor, pushed by a bot, or committed with the escape hatch, and only GitHub can turn an address into an account, so this is the half a laptop cannot check. The collaborator endpoint needs a token with push access: the `Author identity` job asks for `contents: write` for itself alone, stays off until the repository variable `ENFORCE_AUTHOR_IDENTITY` is `true`, and suits a repository that takes no pull requests from forks, whose tokens are read-only.

```bash
GITHUB_TOKEN=… node tooling/scripts/git/check-author-identity.mjs <owner/repo> <pull-request-number>
```

### The branch checks

**`check-linked-branch.mjs`** reads the issue number from a branch named `<type>/<issue>-<slug>`. On the first push of such a branch, when the remote does not have it yet, it asks GitHub through `gh` whether the issue has a linked branch, and stops the push with the commands to move the work onto one when it has none. `gh issue develop` links a branch when it creates it, and a branch that is already on the remote cannot be linked that way, so the first push is the last moment to fix it. Without a remote, network or `gh`, it does not block.

**`check-branch-scope.mjs`** compares the branch with `origin/main`, or `main`, and reports without failing when it mixes concerns or is very large. Pass another base as the first argument, and `--strict` to make the report fail.

| Concern    | Paths                            |
| ---------- | -------------------------------- |
| `product`  | `apps/`, `packages/`             |
| `delivery` | `.github/`                       |
| `tooling`  | `tooling/`, `turbo/`, `.claude/` |

A concern counts when it holds at least 3 files and 10% of the files the branch attributes to a concern. Two or more of them in one branch is reported, and so is a branch over 40 files or 1500 changed lines. Markdown, `docs/`, the spelling dictionary and the files at the root travel with any concern, so a slice with its docs and a lockfile change still counts as one thing.

### Fixing the staged files

```bash
node tooling/scripts/git/fix-staged.mjs --record                 # the setup step of pre-commit
node tooling/scripts/git/fix-staged.mjs prettier {staged_files}  # a pre-commit job, with stage_fixed
```

`pre-commit` fixes the staged files and stages the result, so a formatting slip never costs a second commit. lefthook hides the unstaged part of each partially staged file while the hook runs. If a fixer then rewrites a line whose unstaged edit it hid, lefthook 2.1.14 cannot re-apply that edit and reverts the unstaged changes of every file in the repository, including files the commit never touched ([lefthook issue 1480](https://github.com/evilmartians/lefthook/issues/1480), with a fix proposed upstream). `fix-staged` keeps the fixers off that path:

1. `--record`, the hook's `setup` step, runs before lefthook hides anything and writes the partially staged files to a file in the git directory.
2. `fix-staged <tool> <files>` runs the tool in fix mode on the other files and in check mode on those, and says which files it only checked.

It knows two tools, `eslint` (`--fix --max-warnings 0 --no-warn-ignored`) and `prettier` (`--write --ignore-unknown`), each run through `pnpm exec`. A new pre-commit job that rewrites files goes through it too. Once lefthook releases a fix for that issue, the jobs can call the tools directly again.

## ⌨️ Commands

| Command                                             | What it does                              |
| --------------------------------------------------- | ----------------------------------------- |
| `printf '%s\n' "<message>" \| pnpm exec commitlint` | Check a commit message without committing |
| `pnpm exec lefthook run pre-push`                   | Run the push guards without pushing       |
| `pnpm --filter @repo/scripts test`                  | Run these checks' tests with the others   |

## 🧩 Extending

- A new commit rule is a function in `commit-rules.mjs` that receives the parsed commit and returns `[passes, message]`, registered in `commitRulesPlugin` and turned on in `commitlint.config.mjs`. Give it cases in `commit-rules.test.mjs`, which lints them through the real config.
- A check that only reads git can be one command, tested against a sandbox from `git-sandbox.mjs`; keep the pure rules apart as soon as there is a decision worth testing without a process.
- A guard that stops a push names the way forward in its message. A denial that only says no gets worked around.

## 🔗 Related

- [Commits](../../../CONTRIBUTING.md#commits) and [Git hooks](../../../CONTRIBUTING.md#git-hooks) in the contributing guide
- [@repo/scripts](../README.md): the other checks in this package
