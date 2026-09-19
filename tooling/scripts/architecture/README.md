# 🧭 Architecture

> The runner that lints every Feature-Sliced Design root declared in the list.

## 🎯 Purpose

Steiger takes one folder per run, and this repository can declare several FSD roots. `lint-fsd.mjs` reads [the list](../../architecture/fsd-roots.json) and runs Steiger once per root, so `pnpm lint:arch` covers all of them and reports the ones that failed.

## 🗂️ Structure

| File           | Holds                                                          |
| -------------- | -------------------------------------------------------------- |
| `lint-fsd.mjs` | `pnpm lint:arch`, and `lintFsdRoots({ roots, run })` behind it |

## 🚀 Usage

```bash
pnpm lint:arch
```

Every root is linted even after one fails, so a single run reports all of them; the exit code is 1 when any did. With more than one root, each section of the output is headed by the root it belongs to.

## ⌨️ Commands

| Command          | What it does                |
| ---------------- | --------------------------- |
| `pnpm lint:arch` | Steiger over every FSD root |

## 🧩 Extending

- **A root is added to `fsd-roots.json`**, never here. [The config package](../../architecture/README.md) has the steps.

## 🔗 Related

- [@repo/architecture-config](../../architecture/README.md): the list of roots and both linters' rules
- [Architecture checks](../../../docs/architecture/architecture-checks.md): which check owns which rule
