---
tags: [setup, obsidian, knowledge]
aliases: [Obsidian Setup, Vault Setup]
---

# 🛠️ Obsidian setup

> How to read this repository as an Obsidian vault, what the committed settings decide, and what stays on your machine.

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🚀 Usage](#-usage)
  - [Open the repository as a vault](#open-the-repository-as-a-vault)
  - [Open the graph as a second vault](#open-the-graph-as-a-second-vault)
  - [Plugins](#plugins)
- [🗂️ Shared and personal](#️-shared-and-personal)
- [🧩 Conventions](#-conventions)
- [🔗 Related](#-related)

## 🎯 Purpose

The documentation of this repository is Markdown next to the code it describes, which reads well on GitHub and in an editor. Obsidian adds the parts a folder of files cannot give on its own: backlinks, a graph of how the documents connect, search across all of them, and the properties panel over the `tags` and `aliases` each document carries.

Obsidian is optional. Nothing here depends on it, and the settings that ship are only the ones that make the vault behave the same for everyone.

## 🚀 Usage

### Open the repository as a vault

1. Install [Obsidian](https://obsidian.md).
2. **Open folder as vault**, and pick the repository folder.
3. Start at [Home](../../Home.md), the map of the documentation.

Obsidian reads the committed `.obsidian/` settings straight away. It never asks for trust, because the vault turns on no community plugin.

`node_modules/` and the two agent files that Next.js rewrites are left out of search and the graph view. Folders that begin with a dot, such as `.claude/` and `.graphify/`, are invisible to Obsidian anyway.

### Open the graph as a second vault

The [code graph](README.md) writes its notes to `.graphify/obsidian/`. Obsidian does not show folders that start with a dot, so that vault opens on its own: **Open folder as vault** and, in the macOS dialog, press `Cmd`-`Shift`-`.` to reveal them.

### Plugins

No plugin is required, and none is enabled for you. Two are worth knowing about:

| Plugin           | Why you might add it                                             | Why it is not shipped                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Dataview**     | Live lists and tables in an index, instead of lists kept by hand | Its blocks render as plain code on GitHub, and this vault keeps one version of each list that reads well in both                                                        |
| **Obsidian Git** | Commit and pull the vault from inside Obsidian                   | Its commits do not follow [the commit convention](../../CONTRIBUTING.md#commits), so the hooks refuse them, and its automatic pull moves a branch you may be working on |

Install either one for yourself if you want it: Obsidian records that choice in files this repository ignores, so it never turns up in a diff.

## 🗂️ Shared and personal

Committed, because the vault should behave the same for everyone:

| File                                                               | Decides                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [`.obsidian/app.json`](../../.obsidian/app.json)                   | Markdown links, relative and updated on move; attachments beside the note; what search leaves out |
| [`.obsidian/core-plugins.json`](../../.obsidian/core-plugins.json) | Which built-in plugins are on: search, graph, backlinks, properties, canvas, outline              |

Everything else in `.obsidian/` is yours and git-ignored: the pane layout (`workspace.json`), your graph view, the cache, the theme, hotkeys, and any community plugin you install. So is `.trash/`, where Obsidian can move deleted notes.

> [!TIP]
> Those two files are committed, so changing a setting in Obsidian shows up as a diff. Keep a change you meant for everyone, and drop the rest with `git restore .obsidian`.

## 🧩 Conventions

- **Links are ordinary Markdown links**, relative to the file: `[Contributing](../../CONTRIBUTING.md)`. They work on GitHub and in Obsidian alike. The vault is set to write links that way, so the ones Obsidian creates match the ones already here. Wikilinks (`[[…]]`) would break on GitHub, and this template is read there first.
- **Attachments go beside the note that uses them**, in an `assets` folder next to it, which keeps the relative link working on GitHub.
- **Documents carry `tags` and `aliases`** in their front matter, which is what the properties panel and the tag pane read. `README.md` and `CONTRIBUTING.md` are the exception: GitHub shows front matter as a table above the document, and those two are the face of the repository.
- **Generated notes are never edited by hand.** Everything under `.graphify/` is rewritten in full on each rebuild.

## 🔗 Related

- [Home](../../Home.md): the map of this vault
- [Knowledge graph](README.md): what the graph holds and when it is rebuilt
- [Contributing](../../CONTRIBUTING.md): how a change reaches `main`
