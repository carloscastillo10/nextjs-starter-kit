---
tags: [conventions, comments]
aliases: [Comments, Comment conventions]
---

# Comments

How this repository writes comments, and the check that holds the mechanical part of it. It covers every file a person writes and a tool reads: TypeScript and JavaScript, the YAML behind the workflows and the git hooks, the JSON with comments the linters are configured in, and the stylesheets. Markdown documents are prose and follow their own rules.

## Contents

- [The default is no comment](#the-default-is-no-comment)
- [What earns a comment](#what-earns-a-comment)
- [Shape](#shape)
- [What a comment never carries](#what-a-comment-never-carries)
- [The comment check](#the-comment-check)
- [Examples](#examples)

## The default is no comment

A file without comments is the normal case, not a gap. The burden sits on the comment to justify itself, never on its absence.

- **If a comment is needed to say what something does, rename the thing** or extract the step into a function whose name says it.
- **Delete a comment that restates the code** instead of shortening it. A shorter restatement is still a restatement, and it goes stale the first time the code changes without it.
- **A doc block over every member is the shape to watch for.** When the comments are most of the file, the file needs fewer of them, not better ones.

## What earns a comment

A comment carries a reason the code cannot carry by itself:

- a third party's surprising behavior the code works around;
- a business rule whose origin is not visible in the code;
- a choice that looks wrong and is not, with the reason it is right;
- a non-obvious invariant or ordering constraint that a later edit could break.

The comment states the reason itself, in full. It does not point somewhere else for it.

## Shape

| Where                                                              | Form                                               |
| ------------------------------------------------------------------ | -------------------------------------------------- |
| Documents a declaration (a function, a type, an exported constant) | A `/** */` block, always spread over several lines |
| Explains a statement inside a body, in more than one line          | A `/* */` block, always spread over several lines  |
| Anything that fits on one line                                     | `//`, or `#` in YAML                               |
| Inside JSX                                                         | `{/* ... */}`, the only comment syntax JSX accepts |
| In CSS, which has no line comment                                  | `/* ... */`, on one line when one line is enough   |

```ts
/**
 * Prices arrive in minor units from the payment provider, so every
 * amount is divided by 100 once, here, and nowhere else.
 */
export const toMajorUnits = (amountInMinorUnits: number) => amountInMinorUnits / 100;
```

- **A multi-line comment is one block, never a stack of `//` lines.** YAML is the exception, because it has no block form: there a paragraph is a run of `#` lines, and the check counts that run as one block.
- **A block comment never sits on a single line.** `/** Returns the total. */` becomes either a `//` line or a multi-line block; the `/**` and the `*/` each get their own line.
- A trailing comment at the end of a line of code is rare; put the comment above the line instead.

## What a comment never carries

- **Citations.** No file path (`apps/web/src/...`), no import path (`@/shared/...`), no file name (`next.config.ts`), no issue or pull request number (`#42`), no numbered section (`§4`, "section 3.2"). Files move and numbers get renumbered, so a pointer in a comment is a stale pointer waiting to happen. A rule that matters is one the code enforces, not one a comment names. A URL to an upstream bug or a vendor page is allowed when the reason itself is also written out.
- **Commented-out code.** Git keeps the history; delete it.
- **`TODO` and `FIXME` notes.** Open an issue, or do the work now. The linter warns on them.
- **Lint directives.** `// eslint-disable-next-line` and friends are switched off; see [code-style.md](code-style.md#lint-suppressions).
- **Metadata.** Authors, dates and change logs belong to Git.

## The comment check

`pnpm lint:comments` reads every tracked file it has a reader for: TypeScript and JavaScript through the TypeScript parser, YAML through the YAML parser, JSON with comments and CSS through a scanner that knows where the strings are. A parser rather than a search for `#` or `//` is what keeps a hash inside a quoted value, a shell comment inside a block scalar and a URL inside a string from being read as comments. Plain `.json` has no comments to hold, and a template is not the language it renders, so neither is checked. Generated files (`*.d.ts`, the lockfile, build output) and `.claude/` are skipped. Given file arguments it checks only those, which is how the pre-commit hook runs it.

**What fails is what can be judged without ambiguity. What takes judgement only reports.** That line is deliberate, and moving it would cost more than it buys: a gate that fails on a judgement is a gate people learn to route around, and nothing can correct a comment on its own, because sometimes the comment is what is wrong and sometimes the code is. Whether a comment restates the line below it is an argument; whether it names a file path is a regex with nothing to argue about.

**Fails** (non-zero exit):

| Finding                                                                                                                       | Why it fails                                                                                                                                                               |
| ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A citation: a path into the repository, an `@/` import path, a file name, an issue or pull request number, a numbered section | The pointer goes stale; write the reason instead. A file naming itself, and product names such as `Next.js`, are not citations                                             |
| A block comment on a single line (`/* ... */` or `/** ... */` alone on its line)                                              | Use `//`, or spread the block over several lines. `{/* ... */}` in JSX, bundler annotations such as `/*#__PURE__*/`, and CSS, which has no line comment, are exempt        |
| An ESLint directive (`eslint-disable`, `eslint-enable`, `eslint`, `global`)                                                   | Inline directives are ignored by the linter; change the config for the glob instead. Judged only in the files ESLint reads, since the words mean nothing in a YAML comment |
| A file no reader could parse                                                                                                  | A file the check cannot read is a file it cannot hold to any of the above                                                                                                  |

**Reports** (printed, exit code unaffected):

| Finding                     | Reported at                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| More comment than code      | Over 25% of the non-blank lines of a file of 20 or more non-blank lines                                                                  |
| One block became an essay   | A comment block longer than 12 lines, counting a run of line comments as the one block it reads as                                       |
| A doc block on every member | At least 60% of the exports of a file with 3 or more exports                                                                             |
| Commented-out code          | A comment line that reads like code: a declaration or a statement where the language has them, a key with a value or a list item in YAML |

Read the reports instead of scrolling past them. They are addressed to whoever wrote the comment, not enforced against them, and whether a comment restates its code is a judgement no heuristic can make, so review makes it.

ESLint covers the rest: `@stylistic/multiline-comment-style` rejects stacks of `//` lines (and turns them into one block with `--fix`), and `no-warning-comments` warns on `TODO`, `FIXME`, `HACK` and `XXX`.

## Examples

```ts
// Bad: restates the code
// Increment the counter by one
count += 1;

// Bad: a stack of line comments
// The provider sends amounts in minor units,
// so divide by 100 here.
const amount = rawAmount / 100;

// Bad: cites a file and an issue
// Same fix as in format-price.ts, see #42.
const amount = rawAmount / 100;

// Bad: a doc block squeezed onto one line
/** Converts minor units to major units. */
export const toMajorUnits = (amountInMinorUnits: number) => amountInMinorUnits / 100;
```

```ts
// Good: no comment, because the name says it
export const toMajorUnits = (amountInMinorUnits: number) => amountInMinorUnits / 100;

// Good: one line, a reason the code cannot carry
// The provider rounds half-cents down; match it so totals reconcile.
const amount = Math.floor(rawAmount) / 100;
```

```ts
const loadSession = async () => {
  const session = await readSession();

  /*
   * The session cookie outlives the provider's token by a few seconds, so an
   * expired token can arrive with a valid cookie. Refresh before trusting it.
   */
  if (isExpired(session.token)) return refreshSession(session);

  return session;
};
```
