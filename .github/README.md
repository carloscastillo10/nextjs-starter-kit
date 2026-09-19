# 🐙 GitHub configuration

> The issue forms, the pull request template, the labels and the workflows that run on GitHub.

## 🎯 Purpose

The flow in [`CONTRIBUTING.md`](../CONTRIBUTING.md) is only real if GitHub asks for the right things and
checks them. That is what this folder is: the forms that make an issue answerable, the template that makes a
pull request reviewable, and the two workflows that run the same checks a laptop runs.

**Nothing here depends on GitHub Projects.** No board, no status field, no project URL: issues, labels and
the [GitHub CLI](https://cli.github.com) are the whole substrate.

## 🗂️ Structure

| Path                                                     | Holds                                                                                      |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `ISSUE_TEMPLATE/bug.yml`                                 | A bug: what happens, what should happen, where, and how to reproduce it                    |
| `ISSUE_TEMPLATE/feature.yml`                             | One unit of work: the slice layer by layer, acceptance criteria, the skills it needs       |
| `ISSUE_TEMPLATE/config.yml`                              | The links beside the forms. **Absolute URLs**, which a new repository points at itself     |
| [`pull_request_template.md`](./pull_request_template.md) | What changed, how it was verified, what the branch learned, and the checklist              |
| `labels.yml`                                             | The six labels, with the reason the taxonomy stops at six                                  |
| `workflows/ci.yml`                                       | `Checks`, every gate; and `Author identity`, off unless a variable turns it on             |
| `workflows/pr-title.yml`                                 | The pull request title, against the same commit rules                                      |
| `workflows/assign-on-open.yml`                           | Assigns a new pull request to its author, and the issues its body closes                   |
| `dependabot.yml`                                         | One grouped pull request a month for the workflow actions                                  |
| `.markdownlint.jsonc`                                    | Allows inline HTML in this folder only, because the pull request template uses `<details>` |

## 🚀 Usage

`pnpm gates` runs locally exactly what the `Checks` job runs, by **reading the job out of `ci.yml`** rather
than by keeping a second list:

```bash
pnpm gates
```

A new check is therefore one step in that job, with the same `if:` condition as the others, and both CI and
`pnpm gates` pick it up.

## 🔁 How it updates

| Piece                | Changes when                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| The workflows        | A check is added or the toolchain moves. Node comes from `.nvmrc` and pnpm from `packageManager`, so neither is written here |
| The actions          | Dependabot, monthly, grouped. Each action is pinned to a commit SHA with its version in a comment                            |
| The forms and labels | The taxonomy changes. A form that offers a label that does not exist applies nothing and warns nobody                        |

## 🧩 Extending

- **A label** is a row in `labels.yml` **and** a `gh label create` line in
  [`CONTRIBUTING.md`](../CONTRIBUTING.md#repository-settings). Labels do not travel with "Use this template",
  so the commands are how a new repository gets them.
- **A form field** that offers a fixed list — skills, surfaces, layers — is covered by a test in
  [`@repo/scripts`](../tooling/scripts/github/README.md) that fails when an option names something the
  repository does not have.
- **A workflow** keeps the shape of the two that exist: `permissions` narrowed to what it needs,
  `timeout-minutes` set, actions pinned by SHA, and `persist-credentials: false` on checkout.

> [!IMPORTANT]
> A repository created from this template inherits none of the settings: the squash-only merge, the branch
> ruleset, the labels and the `contact_links` of `ISSUE_TEMPLATE/config.yml` are all set once, with the
> commands in [`CONTRIBUTING.md`](../CONTRIBUTING.md#repository-settings).

## 🔗 Related

- [Contributing](../CONTRIBUTING.md): the flow these files implement, and the repository settings
- [`@repo/scripts`](../tooling/scripts/README.md): `pnpm gates`, and the tests that hold this folder in step
- [`AGENTS.md`](../AGENTS.md): the commands that open these issues and pull requests
