# 🔤 @repo/spell-check-config

> Spell checking for code and docs, with the project's own word list.

## 🎯 Purpose

Typos in names, messages and docs get caught before review. cspell reads identifiers split at camel case, so `formatPrice` is checked as "format" and "price".

## 🗂️ Structure

| File                | Holds                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `cspell.json`       | Language, the project dictionary, and the paths never checked                                    |
| `project-words.txt` | Words the built-in dictionaries do not know: product and library names, terms of the conventions |

Never checked: dependencies, build output and caches, lockfiles, generated type files, vendored skills under `.claude/skills/`, the worktrees of `.claude/worktrees/` and `.agents/`. The agent definitions and slash commands of `.claude/` are checked, with the words that belong to them alone in `.claude/cspell.json`.

## 🚀 Usage

Every workspace has a `cspell.json` that imports this one, and the root `cspell.json` covers the files that belong to no workspace. A workspace needs `cspell` in its `devDependencies` and the script:

```json
{
  "spell:check": "cspell --no-progress --gitignore --config cspell.json ."
}
```

cspell also resolves the nearest config for each file it is given, so a word declared in a workspace is known when the pre-commit hook checks that file from the repository root.

## ⌨️ Commands

| Command            | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `pnpm spell:check` | Check every package, and the files that belong to no package |

## 🧩 Extending

- **A word is flagged but correct and only one workspace uses it**: add it to the `words` of that workspace's `cspell.json`. A word the whole repository uses, or one that appears in the files at the root, goes in `project-words.txt`, one per line, in alphabetical order. Case does not matter either way.
- **A word is flagged and wrong**: fix the typo. The list is for real words, not for silencing a report.
- **A file should never be checked**: add a `**/`-prefixed glob to `ignorePaths` in `cspell.json`.

## 🔗 Related

- [markdownlint config](../markdown/README.md), the other check that reads the docs.
