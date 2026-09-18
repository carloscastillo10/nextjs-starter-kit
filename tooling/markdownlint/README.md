# 📝 @repo/markdownlint-config

> markdownlint rules for every Markdown file in the repository.

## 🎯 Purpose

Docs stay consistent and their links stay valid: heading levels in order, a language on every code block, and anchors that point at real headings.

## 🗂️ Structure

| File                 | Holds                                           |
| -------------------- | ----------------------------------------------- |
| `markdownlint.jsonc` | Every default rule, minus the ones listed below |

| Rule                          | Setting       | Why                                                              |
| ----------------------------- | ------------- | ---------------------------------------------------------------- |
| markdownlint's Prettier style | extended      | Prettier formats Markdown; the rules it would argue with are off |
| `MD013` line length           | off           | A paragraph is one line                                          |
| `MD024` duplicate headings    | siblings only | Two sections may each have a "Usage" heading                     |

The docs style works with these rules as they are: YAML front matter, emoji in headings (and anchors to them, such as `#-purpose`), GitHub alerts (`> [!NOTE]`), badge images and `mermaid` code blocks. Inline HTML is still reported (`MD033`); HTML comments are fine.

## 🚀 Usage

The root `.markdownlint-cli2.jsonc` extends this config and lists what to check: every `*.md` outside `.gitignore`, `.claude/`, `.agents/` and the agent notes that `next dev` writes.

## ⌨️ Commands

| Command        | What it does                         |
| -------------- | ------------------------------------ |
| `pnpm lint:md` | Lint every Markdown file in one pass |

## 🧩 Extending

- Change or relax a rule in `markdownlint.jsonc`, with a comment that says why.
- Skip a file or folder in the `ignores` of the root `.markdownlint-cli2.jsonc`.

## 🔗 Related

- [cspell config](../cspell/README.md), which spell-checks the same files.
