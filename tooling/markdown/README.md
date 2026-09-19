# 📝 @repo/markdown-config

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

The root `.markdownlint-cli2.jsonc` extends this config and lists what to check: every `*.md` outside `.gitignore`, the skills vendored into `.claude/skills/`, the worktrees of `.claude/worktrees/`, `.agents/` and the agent notes that `next dev` writes. The agent definitions and slash commands of `.claude/` are checked, because their wording is this repository's own.

`.github/.markdownlint.jsonc` extends this config and switches off two rules for that folder alone: `MD041`, because the pull request template opens below the title GitHub renders, and `MD033`, because Markdown has no way to fold a block and the template needs one.

## ⌨️ Commands

| Command        | What it does                         |
| -------------- | ------------------------------------ |
| `pnpm lint:md` | Lint every Markdown file in one pass |

## 🧩 Extending

- Change or relax a rule in `markdownlint.jsonc`, with a comment that says why.
- Skip a file or folder in the `ignores` of the root `.markdownlint-cli2.jsonc`.

## 🔗 Related

- [spell-check config](../spell-check/README.md), which spell-checks the same files.
- [Frontmatter check](../scripts/markdown/README.md), which asks each document for its `tags` and `aliases`.
