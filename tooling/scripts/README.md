# 🛠️ @repo/scripts

> Repository checks that no off-the-shelf tool covers, called by the git hooks and by CI.

## 🎯 Purpose

Holds the checks written for this repository, each with its tests. [lefthook](../../lefthook.yml) and the [CI workflows](../../.github/workflows) call them, so a rule the team agreed on is enforced by the repository rather than remembered by a person.

## 🗂️ Structure

| File                 | Holds                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| `commit-rules.mjs`   | The commit convention as commitlint rules, loaded by the root `commitlint.config.mjs`                   |
| `comment-rules.mjs`  | The comment rules: `inspectComments({ code, file })` and `isCheckedSource(file)`, with no I/O           |
| `check-comments.mjs` | The comment check command: picks the files, prints the findings, sets the exit code                     |
| `*.test.mjs`         | Tests, with inline fixtures or a temporary git repository                                               |
| `turbo.json`         | Adds the root files the tests read, the commitlint config and the CI workflow, to the test cache inputs |

## 🚀 Usage

### The commit convention

```text
type(scope): <gitmoji> Message
```

[`CONTRIBUTING.md`](../../CONTRIBUTING.md#commits) lists the rules for whoever writes a commit. This section is for whoever changes them. The root `commitlint.config.mjs` parses the header into `type`, `scope` and `subject`, then runs three built-in rules and the seven in `commit-rules.mjs`:

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

### The comment check

```bash
pnpm lint:comments                       # every source file git tracks
pnpm lint:comments apps/web/next.config.ts  # only the files named, as the pre-commit hook runs it
```

It enforces the machine-checkable half of the [comment conventions](../../docs/conventions/comments.md). It reads the comments with the TypeScript parser, so strings and URLs that look like comments are left alone. It skips `*.d.ts`, build output, dependencies, `.claude/` and `.agents/`.

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

| Command                                             | What it does                              |
| --------------------------------------------------- | ----------------------------------------- |
| `printf '%s\n' "<message>" \| pnpm exec commitlint` | Check a commit message without committing |
| `pnpm lint:comments [files...]`                     | Run the comment check                     |
| `pnpm --filter @repo/scripts test`                  | Run the scripts' tests                    |

## 🧩 Extending

- Keep a new check in two parts when it has real logic, as the comment check does: a module of pure rules and a small command around it, so the rules can be tested without spawning processes. A check that only reads git can be one command, tested in a temporary repository.
- Add the root script that runs it to the root `package.json`, and the hook or CI step that calls it.
- A new commit rule is a function in `commit-rules.mjs` that receives the parsed commit and returns `[passes, message]`, registered in `commitRulesPlugin` and turned on in `commitlint.config.mjs`. Give it cases in `commit-rules.test.mjs`, which lints them through the real config.
- If a test reads a file outside this package, add it to the `inputs` in `turbo.json`, or a change to that file replays a stale test result from the cache.

## 🔗 Related

- [Commits](../../CONTRIBUTING.md#commits) and [Git hooks](../../CONTRIBUTING.md#git-hooks) in the contributing guide
- [Comment conventions](../../docs/conventions/comments.md#the-comment-check)
