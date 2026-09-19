---
tags: [conventions, documentation, markdown]
aliases: [Documentation conventions, Markdown conventions, README template]
---

# Documentation

How every Markdown file in this repository is written: the one README template, when a document carries
frontmatter, and which check holds each rule. It covers the files a person writes. Generated Markdown, such as
everything graphify writes under `.graphify/`, is rewritten on each run and follows none of this.

## Contents

- [The README template](#the-readme-template)
- [Frontmatter](#frontmatter)
- [Headings and anchors](#headings-and-anchors)
- [Badges](#badges)
- [Links](#links)
- [Tables, alerts and diagrams](#tables-alerts-and-diagrams)
- [Prose](#prose)
- [A complete example](#a-complete-example)
- [Enforcement](#enforcement)

## The README template

Every folder that somebody can work in has a `README.md`, and every one of them has the same shape. A reader
who learned it once knows where to look in the next folder.

```md
# <emoji> <name>

> One line that says what this is for.

## 🎯 Purpose

## 🗂️ Structure

## 🚀 Usage

## ⌨️ Commands

## 🔁 How it updates

## 🧩 Extending

## 🔗 Related
```

| Section             | Holds                                                                                     | When to omit                                   |
| ------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `# <emoji> <name>`  | The workspace name (`@repo/ui`) or the folder's subject, with one emoji before it         | Never                                          |
| `>` tagline         | One sentence, no period needed, that answers "what is this"                               | Never                                          |
| `🎯 Purpose`        | Why the folder exists and what decision it settles for whoever reads it                   | Never                                          |
| `🗂️ Structure`      | A table of paths to what lives there. One row per file or folder that a reader would open | A folder with a single file                    |
| `🚀 Usage`          | The shortest real example: an import, a snippet, the first command somebody runs          | A folder nobody consumes, such as a docs index |
| `⌨️ Commands`       | A table of command to effect. Only commands that work from that folder or from the root   | Nothing is runnable there                      |
| `🔁 How it updates` | What regenerates the contents, what triggers it, and how to run it by hand                | Nothing regenerates it                         |
| `🧩 Extending`      | How to add the next thing: the steps, and what would make it the wrong folder             | Nothing is ever added, which is rare           |
| `🔗 Related`        | Links out: the documents and folders that answer the next question                        | Never; a README with no way out is a dead end  |

Rules for the template:

- **The order is fixed**, and a section that does not apply is left out rather than moved or emptied.
- **No section is invented between them.** A subject that needs its own heading goes under the section it
  belongs to, as an `###` without an emoji.
- **A README whose sections scroll out of view opens with a table of contents**, `## 🧭 Table of contents`,
  right after the tagline and the badges, listing every `##` and `###`. In practice that is past about a
  hundred lines, or sooner when it has `###` subsections somebody would jump to.
- **No frontmatter**, ever. See [Frontmatter](#frontmatter).
- **The root `README.md` is the one exception to the section list.** It is the landing page rather than a
  folder guide, so its headings are the questions a newcomer asks in order — getting started, the stack, the
  layout, the commands — and it keeps everything else: the emoji headings, the tagline, the badges, the
  table of contents and the relative links.
- **It is self-sufficient.** Somebody who has read nothing else can work in the folder after reading it: what
  it holds, how it is used, which commands apply, and where the related files are. If a question can only be
  answered by asking a person, the README is incomplete.

Documents that are not READMEs — the ones under `docs/` — are free in their structure, and use `## Contents`
instead of `## 🧭 Table of contents` when they are long enough to need one.

## Frontmatter

The repository is also an [Obsidian vault](../knowledge/obsidian-setup.md), so documents carry a YAML block
that makes them findable by tag and by alias rather than only by filename.

```yaml
---
tags: [conventions, comments]
aliases: [Comments, Comment conventions]
---
```

| Where                                  | Frontmatter   | Also needs      |
| -------------------------------------- | ------------- | --------------- |
| Any `README.md`, at any depth          | **Forbidden** | —               |
| `CONTRIBUTING.md`                      | **Forbidden** | —               |
| Any other `.md` in the repository root | **Required**  | —               |
| Everything under `docs/`               | **Required**  | —               |
| `docs/adr/*.md`                        | **Required**  | `status`        |
| An index that is not a `README.md`     | **Required**  | `moc` in `tags` |
| Anywhere else                          | Optional      | —               |

- `tags` is a non-empty list of lower-case words. `aliases` is a list of other names the document goes by, and
  it may be empty (`aliases: []`) when the title is the only name it has.
- `status` on a decision record is one of `proposed`, `accepted`, `superseded`, `deprecated`.
- An index named `README.md`, such as [`docs/README.md`](../README.md), is still a README and carries no
  frontmatter. The `moc` tag belongs to the indexes that are not: [`Home.md`](../../Home.md) is the one this
  repository ships.
- **The two files a visitor lands on carry none.** GitHub renders a frontmatter block as a table above the
  first heading, so a `README.md` and `CONTRIBUTING.md` would open with metadata instead of with their title.
  Obsidian still indexes them by title and by the links that reach them.

Out of scope, because nobody here writes them: `.claude/skills/`, `.claude/agents/`, `.claude/commands/` and
`.claude/worktrees/` (vendored, or carrying Claude Code's own frontmatter), `.github/` (issue and pull request
templates), `.agents/`, `.graphify/`, any `.obsidian/`, `apps/*/AGENTS.md` and `apps/*/CLAUDE.md` (written by
`next dev`), `CHANGELOG.md`, `LICENSE.md` and `node_modules/`.

`pnpm lint:frontmatter` enforces exactly this table, and the pre-commit hook runs it on staged Markdown. The
rules live in [`tooling/scripts/markdown/`](../../tooling/scripts/markdown/README.md); changing one of them and
changing this table is a single commit.

## Headings and anchors

- **One `#` per file**, first line after the frontmatter, carrying the emoji.
- **`##` headings carry the emoji from the README template** in a README and in the four documents written
  to the same shape: [`CONTRIBUTING.md`](../../CONTRIBUTING.md), [`Home.md`](../../Home.md),
  [`.github/CONFIGURATION.md`](../../.github/CONFIGURATION.md) and
  [`obsidian-setup.md`](../knowledge/obsidian-setup.md). In `CLAUDE.md`, `AGENTS.md` and the reference
  documents under `docs/`, `##` is plain; `###` is plain everywhere.
- **An anchor is derived from the heading**, so changing a heading breaks every link to it. Emoji are dropped
  and the remaining spaces become hyphens: `## 🎯 Purpose` is `#-purpose`, `## 🗂️ Structure` is `#️-structure`
  because the variation selector survives. markdownlint fails a link to an anchor that does not exist, which
  is what catches the mistake.

## Badges

Badges come from [shields.io](https://shields.io) and sit between the tagline and the first heading.

A badge earns its place when it answers something a reader wants **before** reading the page and it changes
rarely: a major version (`v4`, `19`), a kind (`type-package`, `scaffold`), a count, a license. Nothing checks
a badge, so anything that changes often is a lie waiting to happen.

- **An exact version belongs only to the root `README.md`**, where the badge row sits directly above the
  stack table that repeats the same numbers, so one read checks both against each other. A workspace README
  states a major version at most; the resolved version lives in the `catalog` of
  [`pnpm-workspace.yaml`](../../pnpm-workspace.yaml).
- **A count belongs to an index** that also shows what it counted, such as the number of vendored skills in
  [`.claude/skills/README.md`](../../.claude/skills/README.md).
- **Bump a badge in the commit that bumps what it names.** `doc-steward` reports one that no longer matches.

## Links

- **Relative Markdown links**, `[text](../path/to/file.md)`, which resolve both on GitHub and in Obsidian.
- **No wikilinks.** `[[file]]` renders as literal text on GitHub, and this repository is read there.
- **Link the file, not the folder**: `[tooling](../../tooling/README.md)`, so the link lands on something a
  browser renders.
- A link to a heading of another file carries its anchor: `[the comment check](comments.md#the-comment-check)`.
- External links are ordinary links with the product's name as the text; no bare URLs.

## Tables, alerts and diagrams

- **A table is the default for anything with two or more columns of facts**: paths and what they hold,
  commands and what they do, rules and the check that enforces them.
- **[GitHub alerts](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)**
  carry what a paragraph would bury: `> [!NOTE]` for context worth knowing, `> [!TIP]` for a shortcut,
  `> [!IMPORTANT]` for something that breaks if skipped, `> [!WARNING]` for something that costs data or time.
  Two alerts in a row mean neither is exceptional; keep the one that is.
- **A flow with more than three steps is a `mermaid` block**, not a paragraph. GitHub renders it and Obsidian
  renders it.
- **Every code fence declares its language**, `bash`, `ts`, `tsx`, `css`, `json`, `yaml`, `md` or `text`.
  markdownlint fails a fence without one.
- **No inline HTML.** The only exception is `.github/`, where the pull request template uses `<details>` and
  markdownlint is configured to allow it there and nowhere else.

## Prose

The rule for comments holds for documentation too: write what the reader cannot get from looking, and nothing
else. In practice, in a Markdown file:

- **No step narration.** A heading that says what the section is about makes "In this section we will…"
  redundant.
- **No obvious labels.** A table whose column is `Command` does not need a row that says "the command".
- **One sentence per line is not required**; a paragraph is one line, because `printWidth` does not apply to
  prose here and a diff of reflowed text hides the change.
- **Write the number you measured**, not "fast". If a claim has a command behind it, name the command.
- Run the `stop-slop` skill over a document before committing it. Do not run `humanizer`: it strips emoji from
  headings, which this style uses.

## A complete example

````md
# 🔤 @repo/spell-check-config

> The shared cspell dictionary and the settings every workspace imports.

## 🎯 Purpose

One dictionary for the whole repository, so a word learned once is known everywhere and a typo means the same
thing in every workspace.

## 🗂️ Structure

| Path                | Holds                                                     |
| ------------------- | --------------------------------------------------------- |
| `cspell.json`       | The settings each workspace imports by relative path      |
| `project-words.txt` | Words this project uses that no dictionary knows          |

## 🚀 Usage

Each workspace has a `cspell.json` of its own that imports this one:

```json
{ "import": "../../tooling/spell-check/cspell.json" }
```

## ⌨️ Commands

| Command                     | What it does                          |
| --------------------------- | ------------------------------------- |
| `pnpm spell:check`          | Checks the whole repository           |
| `pnpm spell:check --filter` | Checks one workspace                  |

## 🧩 Extending

Add a real word to `project-words.txt`, one per line, sorted. A word that belongs to one workspace goes in
that workspace's own `cspell.json` instead, so the shared list stays about the project.

## 🔗 Related

- [Tooling](../README.md): the other shared configurations
- [Contributing](../../CONTRIBUTING.md): when the spell check runs
````

## Enforcement

`pnpm lint:md` runs markdownlint over every Markdown file the repository owns, and `pnpm format` runs Prettier
over the same set. Everything not listed here is checked in review, and by the `doc-steward` agent on the diff.

| Rule                                                      | Check                                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Frontmatter where it is required, absent where it is not  | `pnpm lint:frontmatter`                                                           |
| `status` on a decision record                             | `pnpm lint:frontmatter`                                                           |
| One `#` heading, first in the file                        | markdownlint `MD025`, `MD041`                                                     |
| Heading levels increase by one                            | markdownlint `MD001`                                                              |
| A link to an anchor that exists                           | markdownlint `MD051`                                                              |
| A language on every code fence                            | markdownlint `MD040`                                                              |
| No inline HTML, except under `.github/`                   | markdownlint `MD033`                                                              |
| No bare URLs                                              | markdownlint `MD034`                                                              |
| Table alignment, list markers, blank lines, final newline | `pnpm format` (Prettier)                                                          |
| Spelling                                                  | `pnpm spell:check`                                                                |
| The README template, and a README that answers by itself  | Review, and `doc-steward` through [`/doc-review`](../../CONTRIBUTING.md#the-flow) |
