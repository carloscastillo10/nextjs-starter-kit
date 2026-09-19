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

**A citation fails, a shape reports.** The split is the point. Whether a comment restates its code is an argument; whether it names a file path is six regexes with nothing to argue about. A heuristic that fails a commit is a heuristic people learn to route around.

## 🗂️ Structure

| File                                         | Holds                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------- |
| [`comment-rules.mjs`](./comment-rules.mjs)   | The rules: `inspectComments({ code, file })` and `isCheckedSource(file)`. No I/O |
| [`check-comments.mjs`](./check-comments.mjs) | The command: picks the files, prints the findings, sets the exit code            |

## 🚀 Usage

### The comment check

```bash
pnpm lint:comments                          # every source file git tracks
pnpm lint:comments apps/web/next.config.ts  # only the files named, as the pre-commit hook runs it
```

It reads the comments with the TypeScript parser, so strings and URLs that look like comments are left alone. It skips `*.d.ts`, build output, dependencies, `.claude/` and `.agents/`.

| Finding                                                                                                | Result   |
| ------------------------------------------------------------------------------------------------------ | -------- |
| A path into the repository, an `@/` import path, a file name, an issue number, a numbered section      | fails    |
| A block comment alone on a single line                                                                 | fails    |
| An ESLint directive                                                                                    | fails    |
| A file the parser cannot read                                                                          | fails    |
| Over 40% comment lines, a block over 12 lines, doc blocks on most exports, a line that reads like code | reported |

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

`pre-push` runs this. It counts the lines the branch adds to source files and fails when more than 5% of them are comment, once the branch has added at least 200 lines. Below that the number says nothing: a two-line fix with the reason above it is half comment and exactly right.

The per-file density report above convicts one file; this one convicts a habit, which is the version worth catching before a reviewer reads the branch. Without a base to fork from, a fresh clone with no `origin/main`, it says so and passes.

### Comments that echo a document

```bash
pnpm lint:echo                 # against origin/main
pnpm lint:echo origin/release  # against another base
```

`pre-push` runs this too. It takes the comments the branch adds and the Markdown the branch adds, and fails when eight words in a row appear in both. It reads the working tree rather than `HEAD`, so a comment already deleted does not count. With no `origin/main` to fork from, which is every clone until its first push, it says so and passes, like the other checks that read a branch against its base.

**A reason written twice drifts**, and the copy beside the code is the one that goes stale first, because a reader looking for reasoning opens the document. Delete the comment and keep the document, or delete the paragraph and keep the comment.

## ⌨️ Commands

| Command                         | What it does          |
| ------------------------------- | --------------------- |
| `pnpm lint:comments [files...]` | Run the comment check |

## 🧩 Extending

- A new citation is one entry in `CITATIONS`: a `rule`, the `what` that completes "cites …", and a global regex. Write the case that should fail and the near miss that should not; the near miss is what keeps the regex honest.
- **Decide first whether the finding fails or reports.** Anything a reasonable comment can trip is a report, and reports are read by whoever wrote them, not enforced.
- The thresholds are named constants with the reason beside them. Change the number, not the name.
- A check that reads a branch takes its base as an argument and passes when the base is missing. A fresh clone has no `origin/main`, and a check that fails there is a check nobody can run.

## 🔗 Related

- [Comment conventions](../../../docs/conventions/comments.md): the rule these checks enforce part of
- [@repo/scripts](../README.md): the other checks in this package
