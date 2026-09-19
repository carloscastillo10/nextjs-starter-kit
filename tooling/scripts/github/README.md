# 🐙 GitHub checks

> What the workflows read out of a pull request, and which files have to keep saying the same thing.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [Who owns a pull request](#who-owns-a-pull-request)
  - [The four files that agree](#the-four-files-that-agree)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

The flow needs issues, labels and `gh`, and nothing else: no project board, no status field, no column to move. What it does need is that the files describing the flow agree with each other, which is what lives here.

## 🗂️ Structure

| File                    | Holds                                                                                                      |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| `read-closing-refs.mjs` | `readClosingRefs(body)`: the issues a pull request body says it closes, for the workflow that assigns them |

## 🚀 Usage

### Who owns a pull request

```bash
PR_BODY="$(gh pr view 12 --json body -q .body)" node tooling/scripts/github/read-closing-refs.mjs
```

`readClosingRefs` returns the issues a description says it closes, and `assign-on-open.yml` gives each of them the same owner as the pull request. It reads `Closes`, `Fixes` and `Resolves` in every form GitHub accepts, honours one inside a blockquote and ignores one inside code, so a description that shows the keyword as an example closes nothing. An issue somebody already holds is left alone: the workflow fills a gap, it never moves work off a person.

### The four files that agree

Issue forms, labels, the pull request template and the contributing guide describe one flow, and nothing stops three of them from moving while the fourth stays. Three agreements hold it together: every label a form applies exists in `labels.yml`, every skill in a form's dropdown has a folder under `.claude/skills/` or is an enabled plugin, and the sections the shell guard hands over are the sections the template has.

## 🧩 Extending

- A workflow that needs to read something out of a pull request calls a script here rather than writing the parsing into the YAML, where nobody can run it on its own.
- A new file describing the flow is named in the section above the day it is added. Writing it down is cheap; discovering that a form applies a label nobody created is not.

## 🔗 Related

- [How work moves](../../../CONTRIBUTING.md#-how-work-moves): the flow the workflows automate
- [@repo/scripts](../README.md): the other checks in this package
