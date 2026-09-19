# 🔤 @repo/spell-check-config

> Spell checking for code and docs, with the project's own word list.

## 🎯 Purpose

Typos in names, messages and docs get caught before review. cspell reads identifiers split at camel case, so `formatPrice` is checked as "format" and "price".

## 🗂️ Structure

| File                | Holds                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| `cspell.json`       | Language, the project dictionary, and the paths never checked                                    |
| `project-words.txt` | Words the built-in dictionaries do not know: product and library names, terms of the conventions |

Never checked: dependencies, build output and caches, lockfiles, generated type files, `.claude/` and `.agents/`.

## 🚀 Usage

The root `cspell.json` imports this config, and cspell finds that file from any package, so a package only needs `cspell` in its `devDependencies` and the script:

```json
{
  "spell:check": "cspell --no-progress --gitignore ."
}
```

## ⌨️ Commands

| Command            | What it does                                                 |
| ------------------ | ------------------------------------------------------------ |
| `pnpm spell:check` | Check every package, and the files that belong to no package |

## 🧩 Extending

- **A word is flagged but correct**: add it to `project-words.txt`, one per line, in alphabetical order. Case does not matter.
- **A word is flagged and wrong**: fix the typo. The list is for real words, not for silencing a report.
- **A file should never be checked**: add a `**/`-prefixed glob to `ignorePaths` in `cspell.json`.

## 🔗 Related

- [markdownlint config](../markdownlint/README.md), the other check that reads the docs.
