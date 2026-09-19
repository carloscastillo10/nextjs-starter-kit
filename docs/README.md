# 📚 Docs

> Everything this repository has written down, one folder per kind of document, readable on GitHub and in Obsidian.

## 🎯 Purpose

Code says what the system does. These folders say **why it has this shape, how it is meant to be worked on,
and what it is supposed to do** — the three things a diff can never carry. They are also what the
[`doc-steward`](../.claude/agents/doc-steward.md) agent reads a change against, so a change that contradicts
one of them is reported rather than merged quietly.

Most of this tree ships **empty on purpose**. A template cannot know your specs, your decisions or your
vendors, but it can decide in advance where each of them goes, so the first one is not filed by guess.

## 🗂️ Structure

| Folder                                    | Holds                                                                   | Ships with |
| ----------------------------------------- | ----------------------------------------------------------------------- | ---------- |
| [`adr/`](adr/README.md)                   | One decision per file, with the alternatives that lost                  | Nine       |
| [`agents/`](agents/README.md)             | The rules your product gives an AI agent: domain words, tracker, triage | Empty      |
| [`architecture/`](architecture/README.md) | How the code is organized, and the checks that hold the structure       | Two        |
| [`archive/`](archive/README.md)           | Specs and plans that are done or superseded, kept rather than deleted   | Empty      |
| [`conventions/`](conventions/README.md)   | How code and documentation are written here                             | Four       |
| [`designs/`](designs/README.md)           | Design handoffs: screens, states and what changed between drops         | Empty      |
| [`integrations/`](integrations/README.md) | One guide per external service: what it is for and the traps it has     | Empty      |
| [`knowledge/`](knowledge/README.md)       | The code graph and the Obsidian vault                                   | Two        |
| [`plans/`](plans/README.md)               | Implementation plans too long to live in an issue                       | Empty      |
| [`specs/`](specs/README.md)               | The behavior a feature is built against, before it is built             | Empty      |
| [`business-rules.md`](business-rules.md)  | The `BR-xx` catalog: rules that cross every feature                     | A seed     |
| [`deployment.md`](deployment.md)          | What the host runs, measured on a real production build                 | Filled in  |

Outside this folder, and part of the same written record: [`README.md`](../README.md) for the repository,
[`CONTRIBUTING.md`](../CONTRIBUTING.md) for the flow, [`CLAUDE.md`](../CLAUDE.md) and
[`AGENTS.md`](../AGENTS.md) for agents, [`DESIGN.md`](../DESIGN.md) for the design system, and one
`README.md` in every workspace.

## 🚀 Usage

Start from [`Home.md`](../Home.md), which is the map of the vault, or read a folder's own README, which says
what goes in it and how a file there is named.

Where a piece of writing belongs is one table, repeated in each of the four folders it concerns so nobody has
to find it:

| What it is                                  | Where it goes                                                                      | How long it lives                       |
| ------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------- |
| The plan for one issue                      | The issue                                                                          | Until its pull request merges           |
| A plan long enough to need its own document | [`docs/plans/`](plans/README.md), written with `superpowers:writing-plans`         | Until it has been carried out           |
| A design the work produced that outlives it | [`docs/specs/`](specs/README.md), written with `/spec`                             | Until it is wrong                       |
| A decision that is hard to reverse          | [`docs/adr/`](adr/README.md)                                                       | Forever, superseded rather than deleted |
| Behavior, and the rules that cross features | [`docs/specs/`](specs/README.md) and [`docs/business-rules.md`](business-rules.md) | They are the source of truth            |

**A plan never goes in [`architecture/`](architecture/README.md).** That folder describes the system as it is;
a plan describes a system that does not exist yet, and mixing the two manufactures the drift this tree exists
to prevent.

## ⌨️ Commands

| Command                 | What it does                                                                 |
| ----------------------- | ---------------------------------------------------------------------------- |
| `pnpm lint:frontmatter` | Fails on a document with no `tags` and `aliases`, or an ADR with no `status` |
| `pnpm lint:md`          | markdownlint over every Markdown file, including broken anchors              |
| `pnpm format:fix`       | Prettier: table alignment, list markers, blank lines                         |
| `pnpm spell:check`      | cspell over the prose                                                        |
| `/doc-review`           | Runs `doc-steward` over the current changes and reports what went stale      |

## 🧩 Extending

- **A new document** goes in the folder whose README describes it, named the way that README says, with the
  frontmatter [`conventions/documentation.md`](conventions/documentation.md) requires, and it is added to the
  index of its folder in the same commit. A document no index names is a document nobody finds.
- **A new folder** is a new kind of document, which is rare. Give it a `README.md` in the template, list it in
  the table above and in [`Home.md`](../Home.md), and say in its README what would make a file belong
  somewhere else instead.
- **Removing a document** means moving it to [`archive/`](archive/README.md) when it records something that
  happened, and deleting it when it records something that was never true.

## 🔗 Related

- [Home](../Home.md): the map of the vault, and where to start in Obsidian
- [Obsidian setup](knowledge/obsidian-setup.md): opening the repository as a vault
- [Contributing](../CONTRIBUTING.md): the flow that produces most of these documents
- [Documentation conventions](conventions/documentation.md): the template and the frontmatter rules
