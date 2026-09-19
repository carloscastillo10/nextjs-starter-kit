# 🧭 @repo/architecture-config

> One list of Feature-Sliced Design roots, and the two architecture linters that read it.

![steiger](https://img.shields.io/badge/steiger-v0-0F172A)
![dependency-cruiser](https://img.shields.io/badge/dependency--cruiser-v18-1E40AF)

## 🎯 Purpose

Two linters guard the structure of this repository, and they would drift apart if each carried its own idea of where the FSD layers live. Both read `fsd-roots.json` instead: [Steiger](https://github.com/feature-sliced/steiger) lints every root it names, and [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) reads the same list to protect the public API of the roots a package shares between apps.

Which check owns which rule, and what neither of them sees, is in [the architecture checks guide](../../docs/architecture/architecture-checks.md).

## 🗂️ Structure

| File                           | Holds                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------- |
| `fsd-roots.json`               | The list: one folder per FSD root, relative to the repository root               |
| `fsd-roots.js`                 | `fsdRoots`, `readFsdRoots(source)` and `workspaceOf(root)`, with the validation  |
| `steiger.config.js`            | The FSD ruleset, with the exemptions the Next.js layout and a shared root need   |
| `dependency-cruiser.config.js` | The rules about the graph between workspaces: direction, cycles, and public APIs |

At the repository root sit only the entry points: `steiger.config.mjs`, a one-line re-export that Steiger finds by searching upwards, and the `lint:deps` script, which names the dependency-cruiser config.

## 🚀 Usage

### Adding an FSD root

A root is a folder holding FSD layers. The template ships with one, `apps/web/src`; a package that shares layers between apps is the second case.

`pnpm new` does the three steps below for a package that answers yes to the layers question. By hand:

1. Create the package with its layers, and export them through the package `exports` field, one entry per slice or segment, each pointing at that folder's `index.ts`.
2. Add the folder to `fsd-roots.json`:

   ```json
   { "roots": ["apps/web/src", "packages/<name>/src"] }
   ```

3. Run `pnpm lint:arch`. Steiger now lints the new root as well, named in its own section of the output.

Nothing else is registered: the Steiger exemptions and the dependency-cruiser rules for that root are derived from the list.

> [!NOTE]
> Steiger counts how many slices reference each other inside the root it reads. A root shared between apps is consumed from outside, so `fsd/insignificant-slice` is off for roots outside `apps/`, where it would report every slice as unused.

## ⌨️ Commands

| Command          | What it does                                             |
| ---------------- | -------------------------------------------------------- |
| `pnpm lint:arch` | Steiger over every root in the list, one run per root    |
| `pnpm lint:deps` | dependency-cruiser over `apps`, `packages` and `tooling` |
| `pnpm lint`      | Both of the above, together with ESLint in every package |

## 🧩 Extending

- **A rule about what happens inside a root** belongs to Steiger, in `steiger.config.js`. Scope an exemption to the paths that need it and say why in a comment.
- **A rule about what crosses a workspace boundary** belongs to dependency-cruiser, in `dependency-cruiser.config.js`. Before adding one, check that neither `turbo boundaries` nor `sherif` already reports it: one finding, one check.
- Every rule earns its place by failing once. The guide names the violation to drop in for each of them.

## 🔗 Related

- [Architecture checks](../../docs/architecture/architecture-checks.md): which check owns which rule
- [Feature-Sliced Design](../../docs/architecture/feature-sliced-design.md): the layers themselves
- [`lint-fsd.mjs`](../scripts/architecture/README.md): the runner that calls Steiger once per root
