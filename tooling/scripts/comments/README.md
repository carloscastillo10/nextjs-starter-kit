# 💬 Comment checks

> The machine-checkable half of the comment convention: pointers that rot, and the shapes a file takes when it explains itself.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [The comment check](#the-comment-check)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

[The convention](../../../docs/conventions/comments.md) is a judgement: a comment earns its place by carrying a reason the code cannot. Most of it no tool can decide. What it can decide is a comment that cites something which moves, and the shapes that usually mean a file is explaining itself instead of reading clearly.

**A citation fails, a shape reports.** The split is the point. Whether a comment restates its code is an argument; whether it names a file path is six regexes with nothing to argue about. A heuristic that fails a commit is a heuristic people learn to route around.

## 🗂️ Structure

| File                 | Holds                                                                            |
| -------------------- | -------------------------------------------------------------------------------- |
| `comment-rules.mjs`  | The rules: `inspectComments({ code, file })` and `isCheckedSource(file)`. No I/O |
| `check-comments.mjs` | The command: picks the files, prints the findings, sets the exit code            |

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

## ⌨️ Commands

| Command                            | What it does                            |
| ---------------------------------- | --------------------------------------- |
| `pnpm lint:comments [files...]`    | Run the comment check                   |
| `pnpm --filter @repo/scripts test` | Run these checks' tests with the others |

## 🧩 Extending

- A new citation is one entry in `CITATIONS`: a `rule`, the `what` that completes "cites …", and a global regex. Write the case that should fail and the near miss that should not; the near miss is what keeps the regex honest.
- **Decide first whether the finding fails or reports.** Anything a reasonable comment can trip is a report, and reports are read by whoever wrote them, not enforced.
- The thresholds are named constants with the reason beside them. Change the number, not the name.

## 🔗 Related

- [Comment conventions](../../../docs/conventions/comments.md): the rule these checks enforce part of
- [@repo/scripts](../README.md): the other checks in this package
