# 🤖 Agent rules

> What an AI agent has to know about your product, as opposed to what it has to know about this repository.

## 🎯 Purpose

Two kinds of rules govern an agent here, and they live in different places on purpose.

- **How this repository works** — the skills, the subagents, the commands, the conventions, the flow — is
  already written: [`AGENTS.md`](../../AGENTS.md) is the registry,
  [`CLAUDE.md`](../../CLAUDE.md) holds the rules no tool can check, and
  [`../conventions/`](../conventions/README.md) holds the standard. None of that is repeated here.
- **What your product means** is nobody else's to write. The words your domain uses, how your issue tracker is
  actually run, which label means what: that is what this folder is for, and it ships empty because a template
  cannot know any of it.

## 🗂️ Structure

One file per subject, kebab-case. The three that most products end up needing:

| File               | Holds                                                                                                 |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| `domain.md`        | The words your product uses and what each one means, so an agent stops inventing synonyms             |
| `issue-tracker.md` | How issues are really run here: what `gh` commands to use, what makes an issue ready, what closes one |
| `triage-labels.md` | Which label goes on what, and who decides                                                             |

Each carries frontmatter, like everything under `docs/`:

```md
---
tags: [agents, domain]
aliases: [Domain language]
---
```

## 🚀 Usage

A document here is read, not obeyed by itself: an agent loads it because something pointed at it. Point at it
from the place the rule applies — a line in [`CLAUDE.md`](../../CLAUDE.md), the body of an issue, or a skill
in [`.claude/skills/`](../../.claude/skills/README.md).

> [!TIP]
> A rule short enough to fit in a sentence belongs in a skill, where it stays in context while the code is
> written. A rule that needs a page belongs here, with the skill pointing at it. A rule that a linter could
> check belongs in the linter.

## 🧩 Extending

- **One subject per file**, and nothing that repeats `AGENTS.md`, `CLAUDE.md` or `docs/conventions/`. A rule
  written twice drifts in one of the two places.
- **Write what is true today**, not what should be true. An agent cannot tell an aspiration from a rule.
- **Say who decides** when a rule has an owner. "Ask before labeling `wontfix`" is a rule; "labels should be
  accurate" is not.

## 🔗 Related

- [`AGENTS.md`](../../AGENTS.md): the registry of MCP servers, skills, subagents and commands
- [`CLAUDE.md`](../../CLAUDE.md): the rules no tool can check, and what the hooks enforce for you
- [Conventions](../conventions/README.md): how code and documentation are written here
- [Contributing](../../CONTRIBUTING.md): the flow, including how work is handed to an agent
