# 🐙 GitHub checks

> What the workflows read out of a pull request, and the test that keeps the issue forms, the labels and the guide agreeing.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [Who owns a pull request](#who-owns-a-pull-request)
  - [The metadata test](#the-metadata-test)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

The flow needs issues, labels and `gh`, and nothing else: no project board, no status field, no column to move. What it does need is that the files describing the flow agree with each other, which is what lives here.

## 🗂️ Structure

| File                       | Holds                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `read-closing-refs.mjs`    | `readClosingRefs(body)`: the issues a pull request body says it closes, for the workflow that assigns them |
| `github-metadata.test.mjs` | The agreement between the issue forms, the labels, the pull request template and the contributing guide    |

## 🚀 Usage

### Who owns a pull request

```bash
PR_BODY="$(gh pr view 12 --json body -q .body)" node tooling/scripts/github/read-closing-refs.mjs
```

`readClosingRefs` returns the issues a description says it closes, and `assign-on-open.yml` gives each of them the same owner as the pull request. It reads `Closes`, `Fixes` and `Resolves` in every form GitHub accepts, honours one inside a blockquote and ignores one inside code, so a description that shows the keyword as an example closes nothing. An issue somebody already holds is left alone: the workflow fills a gap, it never moves work off a person.

### The metadata test

Issue forms, labels, the pull request template and the contributing guide describe one flow in four files, and nothing stops three of them from moving. The test holds them together: every label a form applies exists in `labels.yml`, every skill in the form's dropdown has a folder under `.claude/skills/` or is an enabled plugin, and the sections the shell guard hands over are the sections the template has.

## ⌨️ Commands

| Command                            | What it does                            |
| ---------------------------------- | --------------------------------------- |
| `pnpm --filter @repo/scripts test` | Run these checks' tests with the others |

## 🧩 Extending

- A workflow that needs to read something out of a pull request calls a script here rather than writing the parsing into the YAML, where it cannot be tested.
- A new file describing the flow joins the metadata test the day it is added. The test is cheap; discovering that a form applies a label nobody created is not.

## 🔗 Related

- [How work moves](../../../CONTRIBUTING.md#-how-work-moves) in the contributing guide
- [@repo/scripts](../README.md): the other checks in this package
