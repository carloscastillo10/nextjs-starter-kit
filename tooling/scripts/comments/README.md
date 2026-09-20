# 💬 Comment checks

> The machine-checkable half of the comment convention: pointers that rot, changes that are mostly comment, and prose written twice.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [The comment check](#the-comment-check)
  - [The share of a change that is comment](#the-share-of-a-change-that-is-comment)
  - [Comments that echo a document](#comments-that-echo-a-document)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

[The convention](../../../docs/conventions/comments.md) is a judgement: a comment earns its place by carrying a reason the code cannot. Most of it no tool can decide. Three things it can: a comment that cites something which moves, a change that is mostly comment, and a comment repeating a paragraph the same change writes into a document.

**A citation fails, a shape reports.** The split is the point, and it does not move. Whether a comment restates its code is an argument; whether it names a file path is six regexes with nothing to argue about. A heuristic that fails a commit is a heuristic people learn to route around, and nothing here can correct a comment on its own, because sometimes the comment is what is wrong and sometimes the code is.

## 🗂️ Structure

| File                                                 | Holds                                                                                  |
| ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`comment-dialects.mjs`](./comment-dialects.mjs)     | `dialectOf(file)` and `readComments({ code, file })`: which language, and its comments |
| [`comment-rules.mjs`](./comment-rules.mjs)           | The rules: `inspectComments({ code, file })` and `isCheckedSource(file)`. No I/O       |
| [`check-comments.mjs`](./check-comments.mjs)         | The command: picks the files, prints the findings, sets the exit code                  |
| [`comment-echo-rules.mjs`](./comment-echo-rules.mjs) | `findEchoes(diff)`: comments repeating prose the same change writes                    |
| [`check-comment-echo.mjs`](./check-comment-echo.mjs) | The command behind `pnpm lint:echo`                                                    |

## 🚀 Usage

### The comment check

```bash
pnpm lint:comments                          # every source file git tracks
pnpm lint:comments apps/web/next.config.ts  # only the files named, as the pre-commit hook runs it
```

One reader per language, so a hash inside a quoted value, a shell comment inside a block scalar and a URL inside a string are all left alone:

| Files                                   | Read with                               | Comment shapes   |
| --------------------------------------- | --------------------------------------- | ---------------- |
| `.ts` `.tsx` `.js` `.mjs` `.cjs` `.mts` | the TypeScript parser                   | `//` and `/* */` |
| `.yml` `.yaml`                          | the YAML parser                         | `#`              |
| `.jsonc` `.json5`                       | a scanner that tracks the strings       | `//` and `/* */` |
| `.css`                                  | the same scanner, without line comments | `/* */`          |

Plain `.json` has no comments to hold, and a `.hbs` template is not the language it renders, so neither is read. It skips `*.d.ts`, the lockfile, build output, dependencies, `.claude/` and `.agents/`.

| Finding                                                                                                | Result   |
| ------------------------------------------------------------------------------------------------------ | -------- |
| A path into the repository, an `@/` import path, a file name, an issue number, a numbered section      | fails    |
| A block comment alone on a single line, except in CSS, which has no line comment                       | fails    |
| An ESLint directive, in the files ESLint reads                                                         | fails    |
| A file no reader can parse                                                                             | fails    |
| Over 25% comment lines, a block over 12 lines, doc blocks on most exports, a line that reads like code | reported |

```text
apps/web/src/example.ts
  x line 3 cites a file name: "next.config.ts"
  ! line 9 may be commented-out code
check-comments: 12 files, 1 failures
```

### The share of a change that is comment

```bash
pnpm lint:comments --changed origin/main
```

`pre-push` runs this. It counts the lines the branch adds and fails when more than 5% of them are comment, once the branch has added at least 200 lines. Below that the number says nothing: a two-line fix with the reason above it is half comment and exactly right.

**It reads both sides of the diff.** A comment rewritten shorter looks like a new comment on the added side alone, so a branch whose whole point is deleting comment would be convicted for the shorter ones it leaves behind. A change that removes at least as much comment as it writes passes, whatever share of its added lines is comment, because the habit this hunts is writing comment and that change is not it. A comment-heavy file inside such a branch is still caught, by the per-file density report, which is the division of labour: that one convicts a file, this one convicts a habit. Without a base to fork from, a fresh clone with no `origin/main`, it says so and passes.

### Comments that echo a document

```bash
pnpm lint:echo                 # against origin/main
pnpm lint:echo origin/release  # against another base
```

CI and `pre-push` both run this. It takes the comments the branch adds and the Markdown the branch adds, and fails when eight words in a row appear in both. It reads the working tree rather than `HEAD`, so a comment already deleted does not count. With no `origin/main` to fork from, which is every clone until its first push, it says so and passes, like the other checks that read a branch against its base.

**A reason written twice drifts**, and the copy beside the code is the one that goes stale first, because a reader looking for reasoning opens the document. Delete the comment and keep the document, or delete the paragraph and keep the comment.

## ⌨️ Commands

| Command                         | What it does          |
| ------------------------------- | --------------------- |
| `pnpm lint:comments [files...]` | Run the comment check |

## 🧩 Extending

- A new citation is one entry in `CITATIONS`: a `rule`, the `what` that completes "cites …", and a global regex. Write the case that should fail and the near miss that should not; the near miss is what keeps the regex honest.
- **A new language is one entry in `DIALECT_BY_EXTENSION` and one in `READERS`**, returning comments shaped the way the TypeScript parser shapes them (`type`, `value`, `loc`), so no rule has to know where a comment came from. Use the language's own parser when there is one; a search for the comment character finds the ones inside strings too. A rule that only makes sense in some languages takes the dialect and says so, as the ESLint directive and the one-line block do.
- **Decide first whether the finding fails or reports.** Anything a reasonable comment can trip is a report, and reports are read by whoever wrote them, not enforced.
- The thresholds are named constants with the reason beside them. Change the number, not the name.
- A check that reads a branch takes its base as an argument and passes when the base is missing. A fresh clone has no `origin/main`, and a check that fails there is a check nobody can run.

## 🔗 Related

- [Comment conventions](../../../docs/conventions/comments.md): the rule these checks enforce part of
- [@repo/scripts](../README.md): the other checks in this package
