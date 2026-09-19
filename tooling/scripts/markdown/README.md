# 🏷️ Markdown checks

> The frontmatter a document carries, so a vault, a search and a static site all find it the same way.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [What each file has to carry](#what-each-file-has-to-carry)
  - [What is checked](#what-is-checked)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

This repository is also an [Obsidian vault](../../../docs/knowledge/README.md). A note without `tags` is reachable only by the person who remembers where it is, and an alias is how a document answers to the name a reader actually types. Neither shows up as missing while you write, which is why a check asks for them.

The opposite case matters as much. GitHub renders a frontmatter block as a table above the first heading, so the two files a visitor lands on — the README and the contributing guide — carry none.

## 🗂️ Structure

| File                    | Holds                                                                          |
| ----------------------- | ------------------------------------------------------------------------------ |
| `frontmatter-rules.mjs` | `classifyMarkdown(file)` and `inspectFrontmatter({ file, text })`, with no I/O |
| `check-frontmatter.mjs` | The command: picks the files, prints the findings, sets the exit code          |

## 🚀 Usage

```bash
pnpm lint:frontmatter                        # every Markdown file git tracks
pnpm lint:frontmatter docs/conventions/react.md  # only the files named, as the pre-commit hook runs it
```

### What each file has to carry

| Where                                                                            | Frontmatter                       |
| -------------------------------------------------------------------------------- | --------------------------------- |
| Any Markdown at the root of the repository (`DESIGN.md`, `CLAUDE.md`, `Home.md`) | Required                          |
| Anything under `docs/`                                                           | Required                          |
| A decision record under `docs/adr/`                                              | Required, plus `status`           |
| Any `README.md`, and `CONTRIBUTING.md`                                           | Refused                           |
| `.claude/`, `.github/`, `.agents/`, `apps/*/AGENTS.md` and `apps/*/CLAUDE.md`    | Not checked: another tool owns it |
| Generated output (`.graphify/`, `.obsidian/`, `node_modules/`)                   | Not checked                       |
| Anything else                                                                    | Free either way                   |

```yaml
---
tags: [conventions, comments]
aliases: [Comments, Comment conventions]
---
```

A decision record adds `status: proposed | accepted | superseded | deprecated`.

### What is checked

- The block opens the file, closes, and parses as a YAML mapping.
- `tags` is a list with at least one non-empty entry. A document nobody can find is a document nobody reads.
- `aliases` is a list, empty when the title is the only name the document goes by. The key is still required: an empty list says the question was asked.
- A decision record carries one of the four statuses. A record whose status is a guess is worse than none.

Extra keys are welcome. `DESIGN.md` carries its design tokens in the same block, and the check only looks at the keys it owns.

## ⌨️ Commands

| Command                            | What it does                             |
| ---------------------------------- | ---------------------------------------- |
| `pnpm lint:frontmatter [files...]` | Run the frontmatter check                |
| `pnpm lint:md`                     | Run markdownlint over the same documents |
| `pnpm --filter @repo/scripts test` | Run these checks' tests with the others  |

## 🧩 Extending

- **A new folder of documents** is one pattern in `INDEXED` and its cases in `frontmatter-rules.test.mjs`. Keep the folder out of `IGNORED` only if something else really does own the file's frontmatter, the way Claude Code owns the block on an agent definition.
- **A new required key** goes in `listFailures`, with the reason in its message. A message that only names the key teaches nothing; a message that says why the key exists gets it filled in properly.
- The rules are pure and the command is thin on purpose, so a hook can classify one file without spawning a process.

## 🔗 Related

- [Knowledge graph](../../../docs/knowledge/README.md): the vault these keys feed
- [markdownlint config](../../markdown/README.md): the other check that reads the documents
- [@repo/scripts](../README.md): the other checks in this package
