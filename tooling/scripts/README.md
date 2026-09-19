# 🛠️ @repo/scripts

> Repository checks that no off-the-shelf tool covers, called by the git hooks, by CI and by Claude Code.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [Where a check runs](#where-a-check-runs)
  - [Running one by hand](#running-one-by-hand)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

Holds the checks written for this repository, each with its tests. [lefthook](../../lefthook.yml), the [CI workflows](../../.github/workflows) and [`.claude/settings.json`](../../.claude/settings.json) call them, so a rule the team agreed on is enforced by the repository rather than remembered by a person.

## 🗂️ Structure

One folder per subject, each with its own README:

| Folder                                    | Holds                                                                                                                 |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`architecture/`](architecture/README.md) | The Steiger runner that lints every Feature-Sliced Design root in the list                                            |
| [`git/`](git/README.md)                   | The commit convention, the identity of an author, and what a branch may carry                                         |
| [`comments/`](comments/README.md)         | The comment convention: citations that rot, changes that are mostly comment, comments echoing a document              |
| [`markdown/`](markdown/README.md)         | The frontmatter every document carries, so the vault and a search can index it                                        |
| [`gates/`](gates/README.md)               | `pnpm gates`: every check CI runs, read out of the workflow itself                                                    |
| [`github/`](github/README.md)             | What the workflows read out of a pull request, and the agreement between the files that describe the flow             |
| [`graphify/`](graphify/README.md)         | The code graph rebuild: the git hook trigger, the detached worker behind it, and the hint Claude gets before a search |
| [`claude-hooks/`](claude-hooks/README.md) | The hooks Claude Code runs around its own tool calls: the skill reminder and the shell guard                          |
| [`generators/`](generators/README.md)     | What `pnpm new` writes into a new workspace, and how a new FSD root joins the list                                    |

At the root of the package sit only the files that belong to the package as a whole: `package.json`, its `turbo.json`, `eslint.config.mjs`, `vitest.config.mjs`, `cspell.json` and `.prettierignore`.

## 🚀 Usage

### Where a check runs

| Moment                        | Checks                                                                                 |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Before Claude writes a file   | The skill reminder, the shell guard                                                    |
| `pre-commit`                  | The fixers, then the comment, spelling, Markdown, frontmatter and type checks          |
| `commit-msg`                  | The commit convention, the git identity                                                |
| `pre-push`                    | The push authors, the linked branch, the branch scope, then the tests and whole checks |
| `post-commit` and its friends | The code graph rebuild                                                                 |
| CI                            | Every gate of the `checks` job, which `pnpm gates` also runs                           |

### Running one by hand

Every check is a plain Node script with no arguments beyond the files it reads, so it runs from the repository root:

```bash
node tooling/scripts/<folder>/<check>.mjs
```

The README of each folder gives the arguments that matter.

## ⌨️ Commands

| Command                                             | What it does                              |
| --------------------------------------------------- | ----------------------------------------- |
| `pnpm gates`                                        | Run every check CI runs                   |
| `pnpm lint:comments [files...]`                     | Run the comment check                     |
| `pnpm lint:frontmatter [files...]`                  | Run the frontmatter check                 |
| `pnpm lint:echo [base]`                             | Run the comment echo check                |
| `printf '%s\n' "<message>" \| pnpm exec commitlint` | Check a commit message without committing |
| `pnpm graph`                                        | Rebuild the code graph and its notes      |
| `pnpm --filter @repo/scripts test`                  | Run the scripts' tests                    |

## 🧩 Extending

- **Put the check in the folder of its subject**, and give that folder's README a row and a section. A subject with no folder yet gets one, with a README in this shape.
- Keep a check in two parts when it has real logic, as the comment check does: a module of pure rules and a small command around it, so the rules can be tested without spawning processes. A check that only reads git can be one command, tested in a temporary repository.
- Add the root script that runs it to the root `package.json`, and the hook or CI step that calls it.
- If a test reads a file outside this package, add it to the `inputs` in `turbo.json`, or a change to that file replays a stale test result from the cache.

## 🔗 Related

- [Commits](../../CONTRIBUTING.md#commits) and [Git hooks](../../CONTRIBUTING.md#git-hooks) in the contributing guide
- [Comment conventions](../../docs/conventions/comments.md)
- [Knowledge graph](../../docs/knowledge/README.md): the graph these scripts rebuild
