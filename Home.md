---
tags: [moc, home]
aliases: [Home, Vault Home]
---

# 🏠 Vault home

> The map of everything written down in this repository, for reading it in Obsidian or on GitHub.

> [!TIP]
> Open the repository folder as a vault in Obsidian and start here. [Obsidian setup](docs/knowledge/obsidian-setup.md) explains what the shared settings decide and what stays on your machine.

## 🚀 Start here

- [Readme](README.md): what the template is, the stack with its versions, and the first run
- [Contributing](CONTRIBUTING.md): how a change reaches `main`, the commit convention, and the checks on the way
- [Docs](docs/README.md): the whole written record, one folder per kind of document
- [Architecture](docs/architecture/README.md): Feature-Sliced Design in the app, and where each kind of code goes
- [Conventions](docs/conventions/README.md): code style, comments, React and Next.js, and how a document is written
- [Decisions](docs/adr/README.md): why the repository has this shape, with the alternatives that lost
- [Design](DESIGN.md): the design tokens behind the theme, and how to change the brand
- [Knowledge graph](docs/knowledge/README.md): the code graph that rebuilds itself after every commit, checkout and merge

## 🤖 For an agent

- [`AGENTS.md`](AGENTS.md): the registry — the MCP server, the skills, the subagents, the commands
- [`CLAUDE.md`](CLAUDE.md): the rules no tool can check, and what the hooks enforce for you
- [`.claude/`](.claude/README.md): the files themselves, and how to add one

## 🗺️ Maps of content

| Area                | Start at                                                 | Holds                                                       |
| ------------------- | -------------------------------------------------------- | ----------------------------------------------------------- |
| Apps                | [`apps`](apps/README.md)                                 | The deployable applications, and how a second one arrives   |
| App code            | [`apps/web/src`](apps/web/src/README.md)                 | The layers of the Next.js app, one README each              |
| Routes              | [`apps/web/app`](apps/web/app/README.md)                 | Route files, which only re-export pages                     |
| Packages            | [`packages`](packages/README.md)                         | The code the apps import                                    |
| UI kit              | [`packages/ui`](packages/ui/README.md)                   | The shadcn/ui components every app shares                   |
| Environment         | [`packages/env`](packages/env/README.md)                 | One zod schema per variable, and the generated example file |
| Tooling             | [`tooling`](tooling/README.md)                           | Shared configuration for the build and quality tools        |
| Repository checks   | [`tooling/scripts`](tooling/scripts/README.md)           | The checks the git hooks and CI run                         |
| Architecture rules  | [`tooling/architecture`](tooling/architecture/README.md) | The FSD roots, and the rules both architecture linters read |
| Design tokens       | [`tooling/tailwind`](tooling/tailwind/README.md)         | The Tailwind entry point and every token the theme defines  |
| Workspace generator | [`turbo/generators`](turbo/generators/README.md)         | What `pnpm new` writes, and how to extend it                |
| GitHub              | [`.github`](.github/README.md)                           | Issue forms, the pull request template, the workflows       |

### Inside `tooling/scripts`

| Folder                                                   | Holds                                                           |
| -------------------------------------------------------- | --------------------------------------------------------------- |
| [`architecture`](tooling/scripts/architecture/README.md) | The Steiger runner, once per Feature-Sliced Design root         |
| [`claude-hooks`](tooling/scripts/claude-hooks/README.md) | The hooks that run around Claude Code's tool calls              |
| [`comments`](tooling/scripts/comments/README.md)         | The comment convention, and the branch that is mostly comment   |
| [`gates`](tooling/scripts/gates/README.md)               | `pnpm gates`, read out of the CI workflow itself                |
| [`generators`](tooling/scripts/generators/README.md)     | What `pnpm new` plans, and how a new FSD root joins the list    |
| [`git`](tooling/scripts/git/README.md)                   | The commit convention, the authors, and what a branch may carry |
| [`github`](tooling/scripts/github/README.md)             | What the workflows read out of a pull request                   |
| [`graphify`](tooling/scripts/graphify/README.md)         | The background rebuild of the code graph                        |
| [`markdown`](tooling/scripts/markdown/README.md)         | The frontmatter every document carries                          |

### Inside `docs`

| Folder                                        | Holds                                                                   |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| [`adr`](docs/adr/README.md)                   | One decision per file, with the alternatives that lost                  |
| [`agents`](docs/agents/README.md)             | The rules your product gives an AI agent: domain words, tracker, triage |
| [`architecture`](docs/architecture/README.md) | How the code is organized, and the checks that hold the structure       |
| [`archive`](docs/archive/README.md)           | Specs and plans that are done or superseded                             |
| [`conventions`](docs/conventions/README.md)   | How code and documentation are written here                             |
| [`designs`](docs/designs/README.md)           | Design handoffs: screens, states and what changed between drops         |
| [`integrations`](docs/integrations/README.md) | One guide per external service, and the traps it has                    |
| [`knowledge`](docs/knowledge/README.md)       | The code graph and the Obsidian vault                                   |
| [`plans`](docs/plans/README.md)               | Implementation plans too long to live in an issue                       |
| [`specs`](docs/specs/README.md)               | The behavior a feature is built against, before it is built             |
| [`business-rules.md`](docs/business-rules.md) | The `BR-xx` catalog: rules that cross every feature                     |

## 🧠 Code graph

Beside this vault of written documents there is a generated one: [graphify](docs/knowledge/README.md) reads the code and the git history into a graph, rebuilds it in the background whenever `HEAD` moves, and writes a note per community into `.graphify/obsidian/`. It is per clone and out of git, so it exists only once you install graphify and never shows up in a diff.
