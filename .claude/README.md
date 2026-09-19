# 🧠 Claude Code configuration

> What an AI agent loads when it opens this repository: skills, subagents, commands, hooks and permissions.

## 🎯 Purpose

Everything an agent needs is committed, so a fresh clone behaves the same for everybody instead of depending
on what each person happens to have installed. The one exception is plugins, which come from an external
marketplace and are installed once per person — the command is in [Usage](#-usage).

**This folder is the mechanism, not the catalog.** What each piece is and when to reach for it lives in
[`AGENTS.md`](../AGENTS.md); the rules an agent has to obey live in [`CLAUDE.md`](../CLAUDE.md).

## 🗂️ Structure

| Path                            | Holds                                                                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| [`skills/`](./skills/README.md) | Nine vendored skills, one written here, and the record of what was left out and why        |
| `agents/`                       | Thirteen subagents: three that review a change, ten that each own one area of the template |
| `commands/`                     | Five slash commands: `/spec`, `/feature`, `/implement`, `/ship`, `/doc-review`             |
| `settings.json`                 | The declared plugins, the MCP approval and its allowed tools, and the four hooks           |
| `settings.local.json`           | Yours, git-ignored. Anything here overrides the shared file for your clone only            |
| `../.mcp.json`                  | The MCP servers themselves, at the repository root where the convention puts them          |
| `../skills-lock.json`           | Source, path and content hash per vendored skill, written by the skills CLI                |

The hook scripts are not here. They live in
[`tooling/scripts/claude-hooks/`](../tooling/scripts/claude-hooks/README.md), with the rest of the
repository's scripts, because they are ordinary Node programs that happen to be called by an agent.

## 🚀 Usage

Once per person, after cloning — the repository declares these plugins but cannot install them for you:

```bash
claude plugin install superpowers@claude-plugins-official --scope project
claude plugin install modern-web-guidance@claude-plugins-official --scope project
claude plugin install frontend-design@claude-plugins-official --scope project
```

The MCP server is approved in `settings.json`, and that approval only takes effect after you accept the
**workspace trust dialog** the first time you open the repository in Claude Code. A folder you have not
trusted ignores a committed approval and asks, which is the point. Once trusted, a session starts
`npx -y next-devtools-mcp@0.4.0`, which npm downloads on first use; the version is pinned so a new release
cannot arrive unannounced. To keep it off, set `"enabledMcpjsonServers": []` in your `settings.local.json`.

Skills load themselves when their description matches the work, and can be called by name. Subagents are
invoked with the Task tool or routed to by description. Commands are typed as `/name`.

## ⌨️ Commands

| Command                                 | What it does                                           |
| --------------------------------------- | ------------------------------------------------------ |
| `claude plugin list`                    | Which declared plugins you have installed              |
| `claude plugin validate .claude/skills` | Checks the frontmatter of every skill                  |
| `/mcp`                                  | Inside a session: whether `next-devtools` is connected |
| `/doc-review`                           | Runs the documentation lens over the current changes   |

## 🔁 How it updates

- **Skills**: a vendored skill changes only when somebody refreshes it with the pinned CLI, which also
  rewrites `skills-lock.json`. The commands are in [`skills/README.md`](./skills/README.md).
- **Plugins**: `claude plugin update <plugin>@claude-plugins-official` moves you to the version the
  marketplace lists. `settings.json` names them and never pins them.
- **Agents, commands and settings** are edited by hand and reviewed like any other file. markdownlint and
  cspell read `agents/` and `commands/`; Prettier reads only `skills/project-conventions/`, the skill written
  here, so a table in the rest of this folder is aligned by hand.

## 🧩 Extending

- **A subagent** is a Markdown file in `agents/` with `name`, `description`, `tools` and `model` in its
  frontmatter. Give it the narrowest tool list that does its job, say in the body what is _not_ its business,
  and add a row to [`AGENTS.md`](../AGENTS.md) in the same commit.
- **A command** is a Markdown file in `commands/` with a `description`, an `argument-hint` and an
  `allowed-tools` list. A command is a ritual whose order matters; knowledge belongs in a skill instead.
- **A skill** follows the four tests in [`skills/README.md`](./skills/README.md), which also records the
  candidates that were turned down, so nobody re-evaluates them from scratch.
- **A hook** is declared in `settings.json` and written in
  [`tooling/scripts/claude-hooks/`](../tooling/scripts/claude-hooks/README.md), which has the recipe and the
  table of what already runs. A hook runs for everybody, so it stays cheap and says why it stopped you.

> [!IMPORTANT]
> Every linter, formatter, spell checker and the knowledge graph skip `skills/`: vendored skills ship example
> `package.json`, `tsconfig.json` and `.tsx` files that are not this repository's code.

## 🔗 Related

- [`AGENTS.md`](../AGENTS.md): the catalog — what each skill, subagent and command is for
- [`CLAUDE.md`](../CLAUDE.md): the rules no tool can check, and what the hooks enforce
- [`tooling/scripts/claude-hooks/`](../tooling/scripts/claude-hooks/README.md): the hook scripts themselves
- [Claude Code documentation](https://code.claude.com/docs): settings, skills, subagents, hooks
