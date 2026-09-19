# 🏗️ Architecture

> How the code of this repository is organized: where things go, which module may depend on which, and how those rules are checked.

## 🎯 Purpose

This folder describes the system **as it is today**. It is the answer to "where does this file go" and "why
did the linter refuse that import", and it is what a change has to keep true: when the shape of the system
moves, the document moves with it, in the same branch.

It is not a place for plans or for reasoning about alternatives. A plan describes a system that does not exist
yet and belongs in [`../plans/`](../plans/README.md); the reasoning behind a shape belongs in
[`../adr/`](../adr/README.md), where the rejected options are the valuable part.

## 🗂️ Structure

| Document                                             | Covers                                                                                                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [feature-sliced-design.md](feature-sliced-design.md) | Feature-Sliced Design in `apps/web`: layers, import rules, public APIs, naming, the Next.js integration, where workspace packages fit, the FSD roots, the placement tables and the Steiger linter |
| [architecture-checks.md](architecture-checks.md)     | The four checks that guard the structure: what each one owns, how to read a failure, and how to add a rule without reporting the same violation twice                                             |

## 🚀 Usage

Read [feature-sliced-design.md](feature-sliced-design.md) before adding a file to `apps/web`; its placement
guide answers most questions in one table. Read [architecture-checks.md](architecture-checks.md) when a check
fails and it is not obvious which one is complaining or why.

The list of FSD roots both linters read is one file,
[`tooling/architecture/fsd-roots.json`](../../tooling/architecture/README.md), so they cannot disagree.

## ⌨️ Commands

| Command                | What it checks                                                         |
| ---------------------- | ---------------------------------------------------------------------- |
| `pnpm lint:arch`       | Steiger, once per FSD root: layers, slices, public APIs, segment names |
| `pnpm lint:deps`       | dependency-cruiser: the graph between workspaces, and cycles           |
| `pnpm lint:boundaries` | Turborepo: an import that leaves a package the importer never declared |
| `pnpm lint:ws`         | sherif: versions and manifest fields that disagree between workspaces  |
| `pnpm lint`            | ESLint, Steiger and dependency-cruiser. `pnpm gates` runs all four     |

## 🧩 Extending

Write one Markdown file per topic, named in kebab-case after the topic (`data-fetching.md`, not `notes.md`),
and add it to the table above in the same commit. Describe the rules as they are in the code today, with the
check that enforces each one; a rule nothing checks says so.

Adding an FSD root, registering a package or relaxing a rule is a change to
[`tooling/architecture/`](../../tooling/architecture/README.md), and the document that describes it changes
with it. If the change is hard to reverse, it is also an [ADR](../adr/README.md).

## 🔗 Related

- [Decisions](../adr/README.md): why the architecture has this shape
- [Conventions](../conventions/README.md): how the code inside that shape is written
- [@repo/architecture-config](../../tooling/architecture/README.md): the roots and the rules both linters read
- [apps/web/src](../../apps/web/src/README.md): the layers themselves, one README each
