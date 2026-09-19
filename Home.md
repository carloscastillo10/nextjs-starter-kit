---
tags: [moc, home]
aliases: [Home, Vault Home]
---

# 🏠 Vault home

> The map of everything written down in this repository, for reading it in Obsidian or on GitHub.

> [!TIP]
> Open the repository folder as a vault in Obsidian and start here. [Obsidian setup](docs/knowledge/obsidian-setup.md) explains what the shared settings decide and what stays on your machine.

## 🚀 Start here

- [Contributing](CONTRIBUTING.md): how a change reaches `main`, the commit convention, and the checks that run on the way
- [Architecture](docs/architecture/README.md): Feature-Sliced Design in the app, and where each kind of code goes
- [Conventions](docs/conventions/README.md): code style, comments, and the React and Next.js rules
- [Design](DESIGN.md): the design tokens behind the theme, and how to change the brand
- [Knowledge graph](docs/knowledge/README.md): the code graph that rebuilds itself after every commit, checkout and merge

## 🗺️ Maps of content

| Area               | Start at                                                                 | Holds                                                       |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| App code           | [`apps/web/src`](apps/web/src/README.md)                                 | The layers of the Next.js app, one README each              |
| Routes             | [`apps/web/app`](apps/web/app/README.md)                                 | Route files, which only re-export pages                     |
| UI kit             | [`packages/ui`](packages/ui/README.md)                                   | The shadcn/ui components every app shares                   |
| Environment        | [`packages/env`](packages/env/README.md)                                 | One zod schema per variable, and the generated example file |
| Tooling            | [`tooling`](tooling/README.md)                                           | Shared configuration for the build and quality tools        |
| Repository checks  | [`tooling/scripts`](tooling/scripts/README.md)                           | The checks the git hooks and CI run                         |
| Architecture rules | [`tooling/architecture`](tooling/architecture/README.md)                 | The FSD roots, and the rules both architecture linters read |
| Graph scripts      | [`tooling/scripts/graphify`](tooling/scripts/graphify/README.md)         | The background rebuild of the code graph                    |
| Claude Code hooks  | [`tooling/scripts/claude-hooks`](tooling/scripts/claude-hooks/README.md) | The hooks that run around Claude Code's tool calls          |

## 🧠 Code graph

Beside this vault of written documents there is a generated one: [graphify](docs/knowledge/README.md) reads the code and the git history into a graph, rebuilds it in the background whenever `HEAD` moves, and writes a note per community into `.graphify/obsidian/`. It is per clone and out of git, so it exists only once you install graphify and never shows up in a diff.
