# ⚡ nextjs-starter-kit

> A Next.js monorepo template that arrives empty and fully wired: Feature-Sliced Design, shadcn/ui on Tailwind CSS v4, and every check a change has to pass already running.

![node](https://img.shields.io/badge/node-24.18.0-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11.17.0-F69220?logo=pnpm&logoColor=white)
![turborepo](https://img.shields.io/badge/turborepo-2.10-EF4444?logo=turborepo&logoColor=white)
![next.js](https://img.shields.io/badge/next.js-16.3-000000?logo=nextdotjs&logoColor=white)
![react](https://img.shields.io/badge/react-19.3-61DAFB?logo=react&logoColor=black)
![typescript](https://img.shields.io/badge/typescript-6.0-3178C6?logo=typescript&logoColor=white)
![tailwind css](https://img.shields.io/badge/tailwind_css-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![license](https://img.shields.io/badge/license-MIT-0969da)

> [!NOTE]
> **The application is deliberately empty.** `apps/web` renders one blank page. What is not empty is
> everything around it: the layers a feature goes into, the UI kit, the design tokens, the thirteen checks
> `pnpm gates` and CI both run, the git hooks and the commit convention, the workspace generator, and the
> documentation that says where each new thing belongs. Nothing has to be deleted before you start.

## 🧭 Table of contents

- [🚀 Getting started](#-getting-started)
  - [Install the toolchain](#install-the-toolchain)
  - [First run](#first-run)
  - [Troubleshooting](#troubleshooting)
- [🧱 Stack](#-stack)
- [🗺️ Layout](#️-layout)
- [⌨️ Commands](#️-commands)
- [🔁 The development loop](#-the-development-loop)
- [🤝 How work moves](#-how-work-moves)
- [🛠️ Tooling](#️-tooling)
- [💻 Editor setup](#-editor-setup)
- [🔒 Git hooks](#-git-hooks)
- [📦 Adding a workspace](#-adding-a-workspace)
- [🤖 Working with agents](#-working-with-agents)
- [☁️ Deploying](#️-deploying)
- [📚 Documentation](#-documentation)
- [📄 License](#-license)

## 🚀 Getting started

### Install the toolchain

Nothing is installed globally by this repository. Every version is declared in a file, and a version manager
reads it.

| Tool     | Version   | Declared in                                       | Managed by                                                                                                        |
| -------- | --------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Node** | `24.18.0` | [`.nvmrc`](./.nvmrc)                              | [nvm](https://github.com/nvm-sh/nvm#installing-and-updating) or [fnm](https://github.com/Schniz/fnm#installation) |
| **pnpm** | `11.17.0` | [`package.json`](./package.json) `packageManager` | [corepack](https://nodejs.org/api/corepack.html), which ships with Node                                           |

From a machine with neither, on macOS or Linux:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
exec $SHELL -l

nvm install          # installs the exact version .nvmrc declares
nvm use
corepack enable pnpm # once per Node version
```

On **Windows**, use [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) or fnm, then
`corepack enable pnpm` in the same shell.

> [!IMPORTANT]
> The scripts the git hooks run use `/bin/sh`, so the hooks work on macOS, Linux, WSL and CI, and not on
> native Windows. Use WSL there.

### First run

```bash
nvm use
pnpm install          # dependencies, and the git hooks
pnpm dev              # http://localhost:3000
```

Check the toolchain before blaming the code:

```bash
node -v               # v24.18.0
pnpm -v               # 11.17.0
```

The application runs with no configuration. [`.env.example`](./.env.example) lists every variable the
workspaces read, generated from the zod schemas in [`packages/env`](./packages/env/README.md); today the only
one is `NEXT_PUBLIC_SITE_URL`, which has a default. When you need to set one, copy the file to `.env.dev` in
the repository root, which is gitignored:

```bash
cp .env.example .env.dev
```

`APP_ENV` chooses which `.env.<APP_ENV>` file is read and defaults to `dev`. A variable already exported in
your shell outranks the file.

### Troubleshooting

| Symptom                                   | Cause and fix                                                                                   |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ERR_PNPM_UNSUPPORTED_ENGINE`             | The wrong Node version, refused on purpose. Run `nvm use`                                       |
| `pnpm: command not found`                 | corepack is not enabled for this Node version. Run `corepack enable pnpm`                       |
| `pnpm -v` prints `10.x`                   | A global pnpm is ahead on your `PATH`. Run `corepack enable pnpm` again, or use `corepack pnpm` |
| `ls .git/hooks` shows only `*.sample`     | Run `pnpm exec lefthook install`. An install with nothing to do skips the postinstall           |
| A commit is rejected with a rule name     | The commit convention, in [`CONTRIBUTING.md`](./CONTRIBUTING.md#commits)                        |
| A stale build after editing a config file | Config files are not watched. Stop and start `pnpm dev`                                         |

## 🧱 Stack

| Layer              | Choice                                                                     | Version   | Notes                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Runtime            | Node.js                                                                    | `24.18.0` | Pinned, and the install refuses another one — [ADR 05](./docs/adr/05-a-pinned-toolchain.md)                                                         |
| Package manager    | pnpm workspaces                                                            | `11.17.0` | Versions shared through the `catalog` of `pnpm-workspace.yaml`                                                                                      |
| Task runner        | [Turborepo](https://turborepo.com)                                         | `2.10`    | Every check is a task, cached per workspace                                                                                                         |
| Framework          | [Next.js](https://nextjs.org) App Router                                   | `16.3`    | One app, `apps/web`                                                                                                                                 |
| UI library         | [React](https://react.dev)                                                 | `19.3`    | Server Components by default                                                                                                                        |
| Language           | [TypeScript](https://www.typescriptlang.org)                               | `6.0`     | Strict, with type-aware lint rules                                                                                                                  |
| Architecture       | [Feature-Sliced Design](https://feature-sliced.design) 2.1                 | —         | Checked by Steiger and dependency-cruiser                                                                                                           |
| Components         | [shadcn/ui](https://ui.shadcn.com) on [Base UI](https://base-ui.com)       | `4.21`    | Copied into [`packages/ui`](./packages/ui/README.md), yours to edit                                                                                 |
| Styling            | [Tailwind CSS](https://tailwindcss.com)                                    | `4.3`     | CSS-first, tokens in [`tooling/tailwind`](./tooling/tailwind/README.md)                                                                             |
| Icons              | [Lucide](https://lucide.dev)                                               | `1.47`    | The default of the shadcn CLI                                                                                                                       |
| Theme              | [next-themes](https://github.com/pacocoursey/next-themes)                  | `0.4`     | Follows the system; no toggle ships                                                                                                                 |
| Linting            | ESLint flat config                                                         | `10.10`   | Plugins declared one by one — [ADR 06](./docs/adr/06-eslint-without-the-next-config.md)                                                             |
| Formatting         | [Prettier](https://prettier.io)                                            | `3.9.7`   | Exact version: formatting changes in patch releases                                                                                                 |
| Tests              | [Vitest](https://vitest.dev)                                               | `5.0`     | Configured, with no test of the app to delete                                                                                                       |
| Spelling           | [cspell](https://cspell.org)                                               | `10.3`    | One shared dictionary, one `cspell.json` per workspace                                                                                              |
| Markdown           | [markdownlint](https://github.com/DavidAnson/markdownlint)                 | `0.41`    | Plus a frontmatter check written here                                                                                                               |
| Git hooks          | [lefthook](https://lefthook.dev) + [commitlint](https://commitlint.js.org) | `2.1`     | Installed by `pnpm install`                                                                                                                         |
| Knowledge graph    | [graphify](https://github.com/rhanka/graphify)                             | `0.17+`   | Optional, per machine — [`docs/knowledge`](./docs/knowledge/README.md)                                                                              |
| **Authentication** | **Not included, pick your provider**                                       | —         | Where it goes: [the FSD guide](./docs/architecture/feature-sliced-design.md), and why: [ADR 09](./docs/adr/09-no-authentication-in-the-template.md) |

## 🗺️ Layout

| Path                                               | What lives there                                                           |
| -------------------------------------------------- | -------------------------------------------------------------------------- |
| [`apps/`](./apps/README.md)                        | Deployable applications, one folder each                                   |
| [`apps/web`](./apps/web/README.md)                 | The Next.js app: routing in `app/`, the code in `src/` as FSD layers       |
| [`packages/`](./packages/README.md)                | Code the apps import                                                       |
| [`packages/ui`](./packages/ui/README.md)           | The shadcn/ui kit every app shares                                         |
| [`packages/env`](./packages/env/README.md)         | The environment: one zod schema per area, and the generated `.env.example` |
| [`tooling/`](./tooling/README.md)                  | Shared configuration, one workspace per tool                               |
| [`turbo/generators`](./turbo/generators/README.md) | The generator behind `pnpm new`                                            |
| [`docs/`](./docs/README.md)                        | Decisions, architecture, conventions, specs and plans                      |
| [`.claude/`](./.claude/README.md)                  | Agent configuration: skills, subagents, commands, hooks                    |
| [`.github/`](./.github/README.md)                  | Issue forms, the pull request template, the workflows                      |

## ⌨️ Commands

Every check is a Turborepo task, so each workspace owns its script and the root only orchestrates. Add
`--filter web` to any of them to run it in one workspace.

| Command                           | What it does                                                                |
| --------------------------------- | --------------------------------------------------------------------------- |
| `pnpm dev`                        | Every app in watch mode                                                     |
| `pnpm build`                      | Builds through the dependency graph                                         |
| `pnpm gates`                      | Everything CI runs, read out of `ci.yml`, in one command                    |
| `pnpm lint` · `pnpm lint:fix`     | ESLint, Steiger and dependency-cruiser                                      |
| `pnpm format` · `pnpm format:fix` | Prettier                                                                    |
| `pnpm types:check`                | `next typegen`, then TypeScript with no emit                                |
| `pnpm test`                       | Vitest                                                                      |
| `pnpm spell:check`                | cspell over code and prose                                                  |
| `pnpm lint:md`                    | markdownlint over every Markdown file                                       |
| `pnpm lint:frontmatter`           | The `tags` and `aliases` a document carries, and the `status` of a decision |
| `pnpm lint:comments`              | Fails on a comment that cites a path or a ticket; reports density and shape |
| `pnpm lint:echo`                  | Fails on a comment that repeats prose the same branch writes                |
| `pnpm lint:arch`                  | Steiger, over every Feature-Sliced Design root                              |
| `pnpm lint:deps`                  | dependency-cruiser: the graph between workspaces, and cycles                |
| `pnpm lint:boundaries`            | Turborepo: an import that leaves a package the importer never declared      |
| `pnpm lint:ws`                    | sherif: versions and manifest fields that disagree between workspaces       |
| `pnpm env:emit`                   | Rewrites `.env.example` from the schemas                                    |
| `pnpm env:check`                  | Fails when the committed `.env.example` no longer matches them              |
| `pnpm env:check:turbo`            | Fails when `turbo.json` does not declare a variable the schemas read        |
| `pnpm graph` · `pnpm graph:watch` | Rebuilds the code graph now, or on every change                             |
| `pnpm new`                        | Generates a workspace: configs, README and entry point included             |
| `pnpm clean`                      | Removes caches, build output and `node_modules`                             |

## 🔁 The development loop

```bash
pnpm dev
```

Turborepo starts one watcher per app. A change in `packages/ui` or in the theme is picked up by the app
without a manual step, because the packages export TypeScript source rather than a build.

| Not reloaded                                                              | What to do                                         |
| ------------------------------------------------------------------------- | -------------------------------------------------- |
| Config files: `turbo.json`, `tsconfig.json`, `eslint.config.mjs`, PostCSS | Stop and start `pnpm dev`                          |
| A brand new workspace                                                     | `pnpm install`, then restart                       |
| A new folder whose Tailwind classes should be built                       | Add it to `@source` in the stylesheet that owns it |

## 🤝 How work moves

[`CONTRIBUTING.md`](./CONTRIBUTING.md) is the whole flow: the issue, the branch, the commit convention, the
hooks, the two review lenses and the squash into `main`. In short:

```text
/spec   →   /feature   →   /implement   →   /ship   →   review   →   squash into main
(rare)       the issue      layer by layer   gates and the pull request
```

`main` is the only long-lived branch. A change is one branch, one pull request and one squashed commit, whose
subject follows `type(scope): <gitmoji> Message` — [ADR 08](./docs/adr/08-github-flow-with-enforced-commits.md).

> [!TIP]
> A repository created from this template does not inherit this one's settings. The squash-only merge, the
> branch ruleset and the six labels are four commands, in
> [`CONTRIBUTING.md`](./CONTRIBUTING.md#repository-settings).

## 🛠️ Tooling

Shared configuration lives in [`tooling/`](./tooling/README.md) as real workspaces, each consumed by name and
each carrying its own scripts so Turborepo caches it independently.

| Package                                                         | Owns                                                                  |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`@repo/eslint-config`](./tooling/eslint/README.md)             | The flat config: the base rules, React, Next.js, and the syntax rules |
| [`@repo/prettier-config`](./tooling/prettier/README.md)         | Formatting, declared once in the root `package.json`                  |
| [`@repo/typescript-config`](./tooling/typescript/README.md)     | The strict base, and the Next.js variant                              |
| [`@repo/vitest-config`](./tooling/vitest/README.md)             | The test runner, with a React preset                                  |
| [`@repo/spell-check-config`](./tooling/spell-check/README.md)   | The shared dictionary and the project word list                       |
| [`@repo/markdown-config`](./tooling/markdown/README.md)         | markdownlint rules for every Markdown file                            |
| [`@repo/tailwind-config`](./tooling/tailwind/README.md)         | The Tailwind entry point and every design token                       |
| [`@repo/architecture-config`](./tooling/architecture/README.md) | The list of FSD roots both architecture linters read                  |
| [`@repo/scripts`](./tooling/scripts/README.md)                  | The checks written here: comments, frontmatter, git guards, the gates |

## 💻 Editor setup

`.vscode/settings.json` and `.vscode/extensions.json` are committed, so a fresh clone formats and lints like
everyone else with nothing to configure.

1. Open the repository in **Visual Studio Code**.
2. Press `Cmd + Shift + P`, pick **Extensions: Show Recommended Extensions**, and install them.

| Setting                           | Why it matters                                                        |
| --------------------------------- | --------------------------------------------------------------------- |
| `editor.formatOnSave`             | Prettier runs on every save                                           |
| `editor.codeActionsOnSave`        | ESLint fixes and import ordering on save                              |
| `eslint.workingDirectories: auto` | ESLint resolves the right config per workspace                        |
| `prettier.configPath`             | Points the editor at the shared config                                |
| `typescript.tsdk`                 | Uses the repository's TypeScript, not the one bundled with the editor |
| `cSpell.import`                   | Loads the shared dictionary and the project words                     |

Any other editor still gets indentation, line endings and final newlines from
[`.editorconfig`](./.editorconfig).

## 🔒 Git hooks

Managed by [lefthook](https://lefthook.dev) and installed by `pnpm install`.

| Hook                                                         | What it does                                                                                                                       |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `pre-commit`                                                 | Fixes the staged files with ESLint and Prettier and restages them, then checks comments, spelling, Markdown, frontmatter and types |
| `commit-msg`                                                 | The commit convention, and that the commit carries your own git identity                                                           |
| `pre-push`                                                   | Who authored the branch, whether the issue is linked, the branch scope, then tests, architecture and the environment checks        |
| `post-commit`, `post-checkout`, `post-merge`, `post-rewrite` | Rebuild the code graph in the background, and do nothing at all without graphify installed                                         |

A commit of code spends about 3 seconds in its hooks and a push about 3 seconds. The full table, the timings
and the escape hatches are in [`CONTRIBUTING.md`](./CONTRIBUTING.md#git-hooks).

## 📦 Adding a workspace

```bash
pnpm new
pnpm install
```

Four questions — where it goes, its name, one sentence of purpose, and whether it holds Feature-Sliced Design
layers — and the generator writes the `package.json` with the right engines and catalog versions, the four
tooling configs, its own `cspell.json` and `.prettierignore`, an entry point and a README in the house
template. A package with layers is also registered as an FSD root, so both architecture linters cover it.
Details in [`turbo/generators`](./turbo/generators/README.md).

**A new app is not generated.** Run `pnpm create next-app` inside `apps/`, then delete the
`pnpm-workspace.yaml` it writes: this repository declares its workspaces once, at the root.
[`apps/README.md`](./apps/README.md) has the rest of the checklist.

## 🤖 Working with agents

The repository is set up for [Claude Code](https://claude.com/claude-code) and reads as well to any agent that
follows `AGENTS.md`:

- [`AGENTS.md`](./AGENTS.md) is the registry: the MCP server, the skills, the subagents, the commands.
- [`CLAUDE.md`](./CLAUDE.md) is what an agent has to obey and no tool can check.
- [`.claude/`](./.claude/README.md) holds the files themselves, and the hooks that run around tool calls.

One command per person, once, after cloning — plugins come from an external marketplace and are not installed
by opening the repository:

```bash
claude plugin install superpowers@claude-plugins-official --scope project
claude plugin install modern-web-guidance@claude-plugins-official --scope project
claude plugin install frontend-design@claude-plugins-official --scope project
```

## ☁️ Deploying

The app is a standard Next.js build, so any host that runs Node 24 serves it. On
[Vercel](https://vercel.com), import the repository and set **Root Directory** to `apps/web`; the install
command is detected from `packageManager`, so pnpm 11 is used. Set `NEXT_PUBLIC_SITE_URL` to the public origin
in every environment: without it the default is `http://localhost:3000`, and relative Open Graph and canonical
URLs resolve against it.

```bash
pnpm build     # the same build the host runs
```

## 📚 Documentation

| Read                                                  | For                                                                 |
| ----------------------------------------------------- | ------------------------------------------------------------------- |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md)                | The flow, the commit convention, the hooks, CI, repository settings |
| [`docs/architecture/`](./docs/architecture/README.md) | Where code goes, and the four checks that hold the structure        |
| [`docs/conventions/`](./docs/conventions/README.md)   | How code and documentation are written here                         |
| [`docs/adr/`](./docs/adr/README.md)                   | Why the repository has this shape, with the alternatives that lost  |
| [`docs/`](./docs/README.md)                           | The whole written record, one folder per kind of document           |
| [`DESIGN.md`](./DESIGN.md)                            | The design tokens, and how to change the brand                      |
| [`Home.md`](./Home.md)                                | The map, for reading the repository as an Obsidian vault            |

## 📄 License

[MIT](./LICENSE) © Carlos Castillo
