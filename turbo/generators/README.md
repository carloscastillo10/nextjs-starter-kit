# 🏗️ pnpm new

> The generator behind `pnpm new`: four questions, and a workspace that passes every check before anything is written into it.

## 🎯 Purpose

A workspace here is not only a `package.json`: it carries the engines, the catalog versions, the four tooling configs, its own `cspell.json` and `.prettierignore`, and a README in the shape the rest of the repository uses. Written by hand, one of them is always forgotten, and the gate that catches it runs much later. `pnpm new` writes all of them, registers a Feature-Sliced Design root when the package holds layers, and formats what it wrote.

## 🗂️ Structure

| Path         | Holds                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `config.mjs` | The prompts and the actions, which [`@repo/scripts`](../../tooling/scripts/generators/README.md) plans and tests |
| `templates/` | One Handlebars template per file the generator writes                                                            |

## 🚀 Usage

```bash
pnpm new
```

| Question | Answer                                                                               |
| -------- | ------------------------------------------------------------------------------------ |
| Where    | `packages` for code an app imports, `tooling` for configuration the workspaces share |
| Name     | Without the scope: `metrics` becomes `@repo/metrics` in `packages/metrics`           |
| Summary  | One sentence; it becomes the line under the README title                             |
| Layers   | Yes only for a package whose Feature-Sliced Design layers two apps share             |

Then `pnpm install`, so pnpm links the workspace, and the README, which ships with a placeholder purpose and a `scaffold` badge.

Answers can also be passed in, in that order, which is how the generator is exercised without a terminal:

```bash
pnpm exec turbo gen new-workspace --args packages metrics "Counters the apps report." false
```

> [!NOTE]
> The generator is called `new-workspace` because `turbo gen workspace` is a built-in subcommand of Turborepo, which would win over a generator with that name.

### What a generated workspace looks like

- `exports` points at the TypeScript source: every consumer here is a bundler, and Node reads TypeScript on its own. Nothing is compiled to `dist`, so there is no build step to configure or cache.
- A package with layers exposes `./shared/*` instead of a single entry, and its `src` joins [the list of FSD roots](../../tooling/architecture/README.md), so Steiger lints it and dependency-cruiser keeps imports on the public API.
- The last action runs Prettier over what was written, so a template can be laid out for a reader rather than for the formatter.

## 🧩 Extending

- **A file every workspace should carry** is a template here plus a line in `FILES` in [`workspace-plan.mjs`](../../tooling/scripts/generators/workspace-plan.mjs). A test fails while either half is missing.
- **A new app** is not generated here: `pnpm create next-app` writes it, and its own `pnpm-workspace.yaml` has to be deleted afterwards, because this repository declares the workspaces once at the root.
- **A template** is Handlebars. `{{name}}`, `{{packageName}}`, `{{emoji}}`, `{{typeLabel}}` and `{{entry}}` come from the plan; `{{{summary}}}` is triple-braced because it is prose and would otherwise be HTML-escaped.

## 🔗 Related

- [`@repo/scripts` generators](../../tooling/scripts/generators/README.md): the plan, the FSD registration and their tests
- [`@repo/architecture-config`](../../tooling/architecture/README.md): what an FSD root is and how it is linted
- [Contributing](../../CONTRIBUTING.md): the checks a new workspace has to pass
