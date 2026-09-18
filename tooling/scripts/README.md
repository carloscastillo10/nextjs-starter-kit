# 🛠️ @repo/scripts

> Repository checks that no off-the-shelf tool covers.

## 🎯 Purpose

Holds checks written for this repository, each with its tests. Today that is the comment check, which enforces the machine-checkable half of the [comment conventions](../../docs/conventions/comments.md).

## 🗂️ Structure

| File                 | Holds                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| `comment-rules.mjs`  | The rules: `inspectComments({ code, file })` and `isCheckedSource(file)`, with no I/O |
| `check-comments.mjs` | The command: picks the files, prints the findings, sets the exit code                 |
| `*.test.mjs`         | Tests for the rules (inline fixtures) and the command (a temporary git repository)    |

## 🚀 Usage

```bash
pnpm lint:comments                       # every source file git tracks
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

| Command                            | What it does           |
| ---------------------------------- | ---------------------- |
| `pnpm lint:comments [files...]`    | Run the comment check  |
| `pnpm --filter @repo/scripts test` | Run the scripts' tests |

## 🧩 Extending

- Keep a new check in two parts, as the comment check does: a module of pure rules and a small command around it, so the rules can be tested without spawning processes.
- Add the root script that runs it to the root `package.json`.

## 🔗 Related

- [Comment conventions](../../docs/conventions/comments.md#the-comment-check)
