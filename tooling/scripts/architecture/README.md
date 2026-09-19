# 🧭 Architecture

> The runner that lints every Feature-Sliced Design root, and the tests that keep the list honest.

## 🎯 Purpose

Steiger takes one folder per run, and this repository can declare several FSD roots. `lint-fsd.mjs` reads [the list](../../architecture/fsd-roots.json) and runs Steiger once per root, so `pnpm lint:arch` covers all of them and reports the ones that failed.

## 🗂️ Structure

| File                 | Holds                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------- |
| `lint-fsd.mjs`       | `pnpm lint:arch`, and `lintFsdRoots({ roots, run })` behind it                          |
| `fsd-roots.test.mjs` | The validation of `fsd-roots.json`: what a root may look like, and that each one exists |

## 🚀 Usage

```bash
pnpm lint:arch
```

Every root is linted even after one fails, so a single run reports all of them; the exit code is 1 when any did. With more than one root, each section of the output is headed by the root it belongs to.

## ⌨️ Commands

| Command                            | What it does                            |
| ---------------------------------- | --------------------------------------- |
| `pnpm lint:arch`                   | Steiger over every FSD root             |
| `pnpm --filter @repo/scripts test` | Run these checks' tests with the others |

## 🧩 Extending

- **A root is added to `fsd-roots.json`**, never here. [The config package](../../architecture/README.md) has the steps.
- The tests read that file, which is why `turbo.json` names it as an input of the test task.

## 🔗 Related

- [@repo/architecture-config](../../architecture/README.md): the list and both linters' rules
- [Architecture checks](../../../docs/architecture/architecture-checks.md): which check owns which rule
