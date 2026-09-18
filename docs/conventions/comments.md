# Comments

How this repository writes comments in code, and the check that holds the mechanical part of it. Markdown documents are prose and follow their own rules; this document is about comments inside source files (`.ts`, `.tsx`, `.js`, `.mjs` and the rest).

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

| Where | Form |
| --- | --- |
| Documents a declaration (a function, a type, an exported constant) | A `/** */` block, always spread over several lines |
| Explains a statement inside a body, in more than one line | A `/* */` block, always spread over several lines |
| Anything that fits on one line | `//` |
| Inside JSX | `{/* ... */}`, the only comment syntax JSX accepts |

```ts
/**
 * Prices arrive in minor units from the payment provider, so every
 * amount is divided by 100 once, here, and nowhere else.
 */
export const toMajorUnits = (amountInMinorUnits: number) => amountInMinorUnits / 100;
```

- **A multi-line comment is one block, never a stack of `//` lines.**
- **A block comment never sits on a single line.** `/** Returns the total. */` becomes either a `//` line or a multi-line block; the `/**` and the `*/` each get their own line.
- A trailing comment at the end of a line of code is rare; put the comment above the line instead.

## What a comment never carries

- **Citations.** No file path (`apps/web/src/...`), no import path (`@/shared/...`), no file name (`next.config.ts`), no issue or pull request number (`#42`), no numbered section (`§4`, "section 3.2"). Files move and numbers get renumbered, so a pointer in a comment is a stale pointer waiting to happen. A rule that matters is one the code enforces, not one a comment names. A URL to an upstream bug or a vendor page is allowed when the reason itself is also written out.
- **Commented-out code.** Git keeps the history; delete it.
- **`TODO` and `FIXME` notes.** Open an issue, or do the work now. The linter warns on them.
- **Lint directives.** `// eslint-disable-next-line` and friends are switched off; see [code-style.md](code-style.md#lint-suppressions).
- **Metadata.** Authors, dates and change logs belong to Git.

## The comment check

`pnpm lint:comments` checks every tracked source file (or only the files it is given, which is how the pre-commit hook runs it). Generated files (`*.d.ts`, build output) and `.claude/` are skipped. It splits its findings in two, on purpose: what can be matched by a pattern fails, and what needs judgement is only reported.

**Fails** (non-zero exit):

| Finding | Why it fails |
| --- | --- |
| A citation: a path into the repository, an `@/` import path, a file name, an issue or pull request number, a numbered section | The pointer goes stale; write the reason instead. A file naming itself, and product names such as `Next.js`, are not citations |
| A block comment on a single line (`/* ... */` or `/** ... */` alone on its line) | Use `//`, or spread the block over several lines. `{/* ... */}` in JSX and bundler annotations such as `/*#__PURE__*/` are exempt |
| An ESLint directive (`eslint-disable`, `eslint-enable`, `eslint`, `global`) | Inline directives are ignored by the linter; change the config for the glob instead |

**Reports** (printed, exit code unaffected):

| Finding | Reported at |
| --- | --- |
| More comment than code | Over 40% of the non-blank lines of a file of 20 or more non-blank lines |
| One block became an essay | A single comment block longer than 12 lines |
| A doc block on every member | At least 60% of the exports of a file with 3 or more exports |
| Commented-out code | A comment line that reads like code (starts with `import`, `const`, `return`...; ends with `;`, `{` or `}`) |

Read the reports instead of scrolling past them. Whether a comment restates its code is a judgement no heuristic can make, so review makes it.

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
