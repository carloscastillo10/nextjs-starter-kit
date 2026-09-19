# 🧠 Knowledge graph

> A queryable graph of this repository that rebuilds itself after every commit, branch checkout, merge and rebase, and an Obsidian vault to read the documentation in.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
  - [Install graphify](#install-graphify)
  - [Ask the graph](#ask-the-graph)
  - [Live rebuilds while you work](#live-rebuilds-while-you-work)
  - [Read the graph in Obsidian](#read-the-graph-in-obsidian)
- [⌨️ Commands](#️-commands)
- [🔁 How it updates](#-how-it-updates)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

Searching a repository file by file is slow for questions of the shape "what calls this?", "what breaks if I change it?" or "where does this idea live?". [graphify](https://github.com/rhanka/graphify) answers those from a graph it builds out of the syntax tree of every committed code file plus the git history: symbols and files as nodes, calls, imports and commits as edges, grouped into communities with a report on top.

The graph is **per clone and out of git**: it is rebuilt from the checkout in about two seconds, it differs by branch, and it would otherwise be a 600 KB file changing on every commit. A teammate who never installed graphify has no graph, and that is the normal case rather than a fault.

> [!NOTE]
> The graph covers code and git history. Markdown lives in the vault instead: the semantic pass that would read prose sends file contents to a model provider and bills per run, so it stays out of the automatic rebuild.

## 🗂️ Structure

| Path                                       | Written by                    | Holds                                                                        |
| ------------------------------------------ | ----------------------------- | ---------------------------------------------------------------------------- |
| `.graphify/graph.json`                     | `graphify update`             | The graph: nodes, edges, communities                                         |
| `.graphify/GRAPH_REPORT.md`                | `graphify update`             | The report: most connected symbols, communities, surprising links, questions |
| `.graphify/obsidian/`                      | `graphify export obsidian`    | One note per community, an index, and `graph.canvas`                         |
| `.graphify/rebuild.log`                    | the rebuild                   | The output of the last rebuild, with each step and its exit code             |
| `.graphify/.rebuild.lock`                  | the rebuild, `graphify watch` | The process id of whoever is rebuilding                                      |
| `.graphify/.rebuild.pending`               | the git hooks                 | A rebuild asked for and not yet done                                         |
| [`.graphifyignore`](../../.graphifyignore) | you                           | What stays out of the graph: vendored skills, build output, lockfiles        |
| [`.obsidian/`](../../.obsidian)            | you and Obsidian              | The shared vault settings; everything personal is git-ignored                |
| [`Home.md`](../../Home.md)                 | you                           | The map of the documentation vault                                           |

Everything under `.graphify/` is git-ignored, and so is every note the export writes: it is generated, it is rewritten in full on each rebuild, and it is kept out of markdownlint, cspell and Prettier for the same reason.

## 🚀 Usage

### Install graphify

```bash
npm install -g @sentropic/graphify   # once per machine, Node 20 or later
pnpm graph                           # first build, about two seconds on this repository
```

Verified with graphify `0.17.1` and `0.18.0`; `0.17` is the floor, since older versions wrote to `graphify-out/`. Without it installed, nothing in this repository changes: the git hooks do nothing at all.

### Ask the graph

```bash
graphify query "what connects the environment schema to the Next.js config?"
graphify path "createSandbox" "passes"      # how one symbol reaches another
graphify explain "readGates"                # one symbol, its neighbors and where it lives
graphify summary                            # a compact orientation to start from
graphify check-update                       # says whether the graph matches HEAD
```

`.graphify/GRAPH_REPORT.md` is the same material to read rather than query. Claude Code gets a reminder of both before it searches, from the [graph hint hook](../../tooling/scripts/claude-hooks/README.md#the-graph-hint).

### Live rebuilds while you work

```bash
pnpm graph:watch
```

`graphify watch` rebuilds the graph a few seconds after each code change, without waiting for a commit. Two things to know: it refreshes `graph.json` and the report but **not** the Obsidian notes, which the next commit, checkout or `pnpm graph` writes; and, unlike the hooks, it asks for descriptions and community labels, so it leaves instruction files under `.graphify/` for an assistant to answer. Both are harmless, and everything it writes is git-ignored. It shares its lock with the hooks, so a commit made while it runs never starts a competing rebuild.

### Read the graph in Obsidian

The repository is two vaults, and [Obsidian setup](obsidian-setup.md) covers both:

- **The documentation vault** is the repository folder itself, with the shared settings in `.obsidian/` and [`Home.md`](../../Home.md) as its map.
- **The graph vault** is `.graphify/obsidian/`, opened as a vault of its own (`Open folder as vault`; press `Cmd`-`Shift`-`.` in the macOS dialog to see folders that start with a dot). It holds one note per community, listing the symbols and the files behind it.

> [!NOTE]
> In graphify `0.17.1` and `0.18.0` the generated notes link each other as `[[Community 5]]` while the files are named `Community_5.md`, so those links do not resolve, and the cards in `graph.canvas` point at per-note files this export does not write. The notes themselves and the index read fine. Nothing here rewrites generated output by hand: fixes belong upstream or in graphify's own export options.

## ⌨️ Commands

| Command                        | What it does                                              |
| ------------------------------ | --------------------------------------------------------- |
| `pnpm graph`                   | Rebuilds the graph and the notes now, printing each step  |
| `pnpm graph:watch`             | Rebuilds the graph on every code change until you stop it |
| `graphify query "<question>"`  | Walks the graph for an answer instead of reading files    |
| `graphify check-update`        | Reports whether the graph still matches `HEAD`            |
| `cat .graphify/rebuild.log`    | Shows what the last background rebuild did                |
| `LEFTHOOK_EXCLUDE=graph git …` | Runs one git command without the rebuild                  |

## 🔁 How it updates

[lefthook](../../lefthook.yml) runs one job, `graph`, on four hooks. It never blocks and never fails a git command: it returns in about a tenth of a second, leaving a detached process to rebuild.

| Hook            | Runs after                                                     | Rebuilds when                                                    |
| --------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `post-commit`   | A commit, an amend, a cherry-pick                              | Always, except during a rebase                                   |
| `post-checkout` | A branch switch, a new branch, a new worktree, a file checkout | Only for a branch switch, never for a file checkout              |
| `post-merge`    | A merge, and a pull that fast-forwards                         | Always                                                           |
| `post-rewrite`  | A rebase, a `pull --rebase` that replays commits, an amend     | Only after a rebase; an amend already went through `post-commit` |

A rebase replays commits with `post-commit` and `post-checkout` held back, and reaches `post-rewrite` once at the end, so ten replayed commits still mean one rebuild.

Each rebuild runs two commands, and stops if the first fails:

```bash
graphify update . --force --no-description --no-label
graphify export obsidian
```

`--force` lets the graph shrink when a commit or a checkout removes files; without it graphify refuses to replace a graph with a smaller one and the old graph stays for good. The two `--no-` flags keep the rebuild free and offline: with no API key graphify would otherwise leave batches of instructions for an assistant to fill in.

**One rebuild at a time.** A hook that finds a rebuild in progress leaves a request behind instead of starting a second one, and the running rebuild picks it up when it finishes. Three pulls in a row therefore mean one rebuild now and, at most, one more after it. If a rebuild dies, its lock is taken over: a lock counts as abandoned once its process is gone, or once ten minutes pass with no heartbeat.

**When something looks wrong**, read `.graphify/rebuild.log`: it holds the last run, each step and its exit code. `graphify check-update` says whether the graph matches `HEAD`, and `pnpm graph` rebuilds in front of you.

**Turning it off**: `LEFTHOOK_EXCLUDE=graph git commit …` for one command, `LEFTHOOK=0 git commit …` to skip every hook, and, for a whole clone, a `lefthook-local.yml` (git-ignored) with:

```yaml
post-commit:
  jobs:
    - name: graph
      skip: true
```

Uninstalling graphify turns it off everywhere: the hooks go back to doing nothing.

## 🧩 Extending

- **Keep something out of the graph** by adding it to [`.graphifyignore`](../../.graphifyignore), which reads like a `.gitignore`. Vendored skills, build output and lockfiles are already out; check the result with `graphify scope inspect .`.
- **Richer names and descriptions** come from `graphify update .` without the two `--no-` flags: it writes instruction files under `.graphify/` for an assistant to answer, and the next `graphify update` reads the answers back. Whoever wants graphify's own skill in Claude Code installs it for their user, with `graphify install`, so it matches the version of their CLI.
- **Committing graph artifacts** is a deliberate change of mind, not the default. Run `graphify portable-check .graphify` first: it fails when an artifact carries an absolute path from one machine. The lifecycle files (`branch.json`, `worktree.json`, `.rebuild.*`) and `cache/` stay out in any case.

## 🔗 Related

- [Obsidian setup](obsidian-setup.md): opening the vault, what is shared, and what stays on your machine
- [Graph scripts](../../tooling/scripts/graphify/README.md): how the rebuild is wired, for whoever changes it
- [Contributing](../../CONTRIBUTING.md): the git hooks the rest of the checks run in
- [graphify](https://github.com/rhanka/graphify): the tool, its commands and its options
