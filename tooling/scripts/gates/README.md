# 🚦 Gates

> Every check CI runs, run from one command on your machine, with the workflow as the only list.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
- [⌨️ Commands](#️-commands)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

A second list of checks drifts from the first. `pnpm gates` therefore has no list: it reads the `checks` job of [`ci.yml`](../../../.github/workflows/ci.yml) and runs what it finds, so adding a gate to CI is the whole change.

## 🗂️ Structure

| File                                 | Holds                                                                      |
| ------------------------------------ | -------------------------------------------------------------------------- |
| [`read-gates.mjs`](./read-gates.mjs) | `readGates(text, job)`: the gates of a workflow job, with no I/O           |
| [`run-gates.mjs`](./run-gates.mjs)   | `pnpm gates`: runs every gate of the `checks` job from the repository root |

## 🚀 Usage

```bash
pnpm gates
```

A step is a gate when its `if:` calls `cancelled()`: the marker that lets it run after an earlier one failed. Setup steps do not carry it, which tells the two apart without naming either. **Finding no gate at all is an error rather than a pass**, because a check that silently matches nothing reports success.

It keeps going after a failing gate and prints a summary. The exit code is 1 when a gate failed and 2 when it could not read the workflow.

The environment of a step is not copied: CI can pass secrets that a laptop does not have, so each gate runs with the environment of your shell.

## ⌨️ Commands

| Command      | What it does            |
| ------------ | ----------------------- |
| `pnpm gates` | Run every check CI runs |

## 🧩 Extending

- **A gate is added to `ci.yml`, not here.** Give the step a `name`, a `run` and the same `if:` the others carry.
- `pnpm gates` reads the list out of the workflow itself, so a gate added there is a gate this command runs, and the documentation that names the gates is the only copy that can drift.

## 🔗 Related

- [Continuous integration](../../../CONTRIBUTING.md#continuous-integration): the workflow these gates are read out of
- [@repo/scripts](../README.md): the checks these gates call
