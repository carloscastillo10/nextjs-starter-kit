# 🏗️ Generators

> What `pnpm new` writes into a new workspace, and the entry it adds to the list of Feature-Sliced Design roots.

## 🎯 Purpose

`pnpm new` runs [the generator at the root of the repository](../../../turbo/generators/README.md), which asks four questions and writes files. The answers become a plan here, so the generator stays a list of `add` actions and the decisions behind it — where the workspace goes, which files it needs, whether it joins the FSD roots — can be read without running it.

## 🗂️ Structure

| File                    | Holds                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `workspace-plan.mjs`    | `planWorkspace(answers)`: the folder, the files with their templates, and the data the templates render |
| `register-fsd-root.mjs` | `registerFsdRoot({ file, root })`: the new root in `fsd-roots.json`, validated before it is written     |

## 🚀 Usage

```bash
pnpm new
```

`planWorkspace` refuses an answer that a check would reject later: a kind other than `packages` or `tooling`, a name that is not a folder name, an empty summary, or FSD layers asked for outside `packages/`.

`registerFsdRoot` validates the list with the same reader both linters use, before and after the change, so a root that Steiger or dependency-cruiser would not accept never reaches the file. It writes plain JSON; the generator formats what it wrote as its last action.

## ⌨️ Commands

| Command    | What it does       |
| ---------- | ------------------ |
| `pnpm new` | Create a workspace |

## 🧩 Extending

- **A file every workspace needs** is a template in [the generator's folder](../../../turbo/generators/README.md) plus a line in `FILES`. A planned file whose template is missing is written empty, so the two halves land together.

## 🔗 Related

- [`pnpm new`](../../../turbo/generators/README.md): the prompts, the templates and what the generated workspace looks like
- [@repo/architecture-config](../../architecture/README.md): the list of FSD roots and what a root may look like
