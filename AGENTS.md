---
tags: [agents, moc, claude-code, skills, mcp]
aliases: [Agent registry, Agents, Skills and subagents]
---

# 🤖 Agents

The registry of everything an AI agent can load in this repository: the MCP server, the skills, the
subagents and the commands — what each one is, and what it needs to run.

**This file is the catalog**, which is why nothing else lists these names. [`CLAUDE.md`](./CLAUDE.md) is the
other half: the rules an agent has to obey and no tool can check. Conventions live in
[`docs/conventions/`](./docs/conventions/README.md) and the flow lives in
[`CONTRIBUTING.md`](./CONTRIBUTING.md).

> [!IMPORTANT]
> **A skill has to be loaded to be obeyed.** An issue names the skills its work needs rather than trusting
> whoever picks it up to remember, and a hook names the skills that govern a file before it is written. Both
> are reminders, not substitutes for reading them.

## Before your first session

Skills and subagents live in the repository and need no installation. **Plugins come from an external
marketplace and are not installed by opening the repository**, so run this once, from the repository root:

```bash
claude plugin install superpowers@claude-plugins-official --scope project
claude plugin install modern-web-guidance@claude-plugins-official --scope project
claude plugin install frontend-design@claude-plugins-official --scope project
```

Each command reports "already installed" when there is nothing to do, and `--scope project` matches what
[`.claude/settings.json`](./.claude/settings.json) already declares, so the file does not change.

The MCP server is approved in the same file, and that approval takes effect **once you accept the workspace
trust dialog** the first time you open the repository. A folder you have not trusted ignores it and asks.

## MCP servers

Declared in [`.mcp.json`](./.mcp.json), switched on, with its tools allowed, in
[`.claude/settings.json`](./.claude/settings.json).

| Server          | Type  | Runs                             | Purpose                                                                 |
| --------------- | ----- | -------------------------------- | ----------------------------------------------------------------------- |
| `next-devtools` | stdio | `npx -y next-devtools-mcp@0.4.0` | The running dev server, from the inside: errors, logs, routes, metadata |

| Tool           | What it does                                                                                                         |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| `nextjs_index` | Lists what the server can answer                                                                                     |
| `nextjs_call`  | Forwards to the runtime tools of Next.js: errors, logs, routes, page metadata, compilation issues, compiling a route |
| `nextjs_docs`  | The documentation that ships inside the installed `next` package, not a web copy                                     |
| `browser_eval` | Returns instructions for driving a browser; it drives nothing itself                                                 |

All four are pre-approved, because none of them writes a file in the repository. A tool that a later version
adds is not, and asks. **The server version is pinned**: with a shared approval, `@latest` would run whatever
`npx` resolved that day without a prompt.

```bash
/mcp        # inside Claude Code: next-devtools should report connected
```

## Skills

In [`.claude/skills/`](./.claude/skills/README.md), which carries the provenance, the licenses and the
refresh commands. Three kinds, chosen per item:

### Written here

What only this repository can say:

| Skill                 | Load it for                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------- |
| `project-conventions` | Any TypeScript, React or Next.js file: names, exports, function shape, control flow, comments |

### Vendored

Third-party skills with a permissive license, copied in so a fresh clone needs no install:

| Skill                         | Load it for                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------- |
| `feature-sliced-design`       | Where code goes: layers, slices, segments, public APIs                            |
| `shadcn`                      | Adding, composing and theming shadcn/ui components                                |
| `tailwind-css`                | Tailwind v4 syntax: `@theme`, `@source`, `@reference`, and no `tailwind.config.*` |
| `vercel-react-best-practices` | React and Next.js performance, when writing or reviewing                          |
| `vercel-composition-patterns` | Component API design: composition instead of boolean props                        |
| `web-design-guidelines`       | Accessibility and interaction review of UI code                                   |
| `design-md`                   | Writing and linting the root [`DESIGN.md`](./DESIGN.md) against Google's spec     |
| `turborepo`                   | `turbo.json` tasks, caching, filters, monorepo structure                          |
| `stop-slop`                   | Cutting filler out of a README or a document before committing it                 |

### Declared plugins

From Anthropic's official marketplace, installed once per person:

| Plugin                | Load it for                                                                                         |
| --------------------- | --------------------------------------------------------------------------------------------------- |
| `superpowers`         | The working method: brainstorm, plan, test first, debug systematically, verify before claiming done |
| `frontend-design`     | Visual direction and interface copy for new pages                                                   |
| `modern-web-guidance` | Current web platform practice: CSS layout, Core Web Vitals, forms, browser support                  |

> [!NOTE]
> Tailwind Labs publishes no skill, no plugin, no MCP server and no machine-readable index of its
> documentation, and that documentation carries no open-source license. Nothing here bundles, indexes or
> embeds a copy of it: `tailwind-css` links to the official pages, and the guard against Tailwind v3 habits
> is the linter.

## Subagents

In [`.claude/agents/`](./.claude/README.md). Invoke one with the Task tool by `subagent_type`, or let Claude
Code route to it by description. Two groups, and the difference matters: the first three answer questions
about work in progress, the rest maintain one area of the template itself.

### On a change

| Agent                                              | Use it for                                                                                                                                                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`code-steward`](./.claude/agents/code-steward.md) | The code lens on a diff: comments that restate the code, tests that assert wiring, scope nobody asked for, placement no linter judges, an abstraction with one caller. Reports, never writes code          |
| [`doc-steward`](./.claude/agents/doc-steward.md)   | The documentation lens on the same diff: what the change made untrue in the conventions, the architecture guide, an index, a README or a link. What [`/doc-review`](./.claude/commands/doc-review.md) runs |
| [`tech-lead`](./.claude/agents/tech-lead.md)       | Direction, not conventions: which of two ways to build something, whether a change is hard to reverse, whether it contradicts a [decision](./docs/adr/README.md)                                           |

### On the template itself

Each owns one area and its documentation, and refuses to change another's:

| Agent                                                          | Owns                                                                                    |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| [`repo-architect`](./.claude/agents/repo-architect.md)         | The monorepo skeleton: workspaces, the Turborepo pipeline, the pinned Node and pnpm     |
| [`architecture-agent`](./.claude/agents/architecture-agent.md) | Feature-Sliced Design inside the apps, and the two architecture linters                 |
| [`code-style-agent`](./.claude/agents/code-style-agent.md)     | The code standard in `docs/conventions/`, and which rules a linter can take             |
| [`tooling-agent`](./.claude/agents/tooling-agent.md)           | ESLint, Prettier, TypeScript, Vitest, cspell, markdownlint and the repository's scripts |
| [`git-workflow-agent`](./.claude/agents/git-workflow-agent.md) | lefthook, commitlint, the branching model, CI and the contribution flow                 |
| [`ui-agent`](./.claude/agents/ui-agent.md)                     | shadcn/ui, Tailwind CSS v4, the design tokens and `DESIGN.md`                           |
| [`knowledge-agent`](./.claude/agents/knowledge-agent.md)       | The code graph and the Obsidian vault                                                   |
| [`docs-agent`](./.claude/agents/docs-agent.md)                 | Every README, the `docs/` tree, this file and `CLAUDE.md`                               |
| [`skills-audit-agent`](./.claude/agents/skills-audit-agent.md) | What belongs in `.claude/`: skills, plugins, MCP servers                                |
| [`qa-release-agent`](./.claude/agents/qa-release-agent.md)     | The gates, the release checklist and the deploy                                         |

## Commands

Project slash commands in [`.claude/commands/`](./.claude/README.md). The first four are the flow in
[`CONTRIBUTING.md`](./CONTRIBUTING.md#the-flow), one per stage, and each refuses to do the next one's job.

| Command                                                       | Runs                                                                                                                                                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`/spec <topic>`](./.claude/commands/spec.md)                 | The rare first step: drafts a spec into [`docs/specs/`](./docs/specs/README.md) against the architecture guide, the ADRs and the business rules, and leaves what only the product owner can answer in `## Open questions` |
| [`/feature <topic>`](./.claude/commands/feature.md)           | Writes the issue — scope, the vertical slice layer by layer, acceptance criteria, what is out of scope — and offers the branch through `gh issue develop`                                                                 |
| [`/implement <issue>`](./.claude/commands/implement.md)       | Builds the slice layer by layer, loading the skills the issue names. Refuses an issue with no acceptance criteria                                                                                                         |
| [`/ship [issue]`](./.claude/commands/ship.md)                 | Runs `pnpm gates`, both review lenses, answers each acceptance criterion with its evidence, and opens the pull request into `main`                                                                                        |
| [`/doc-review [pr \| ref]`](./.claude/commands/doc-review.md) | The documentation lens on its own, through `doc-steward`. No argument means the current changes against `main`                                                                                                            |

They need [GitHub CLI](https://cli.github.com) authenticated (`gh auth status`) and an issue tracker that is
GitHub Issues. **Nothing depends on GitHub Projects**: no board, no status field, no project URL.

## Hooks

Declared in [`.claude/settings.json`](./.claude/settings.json), written in
[`tooling/scripts/claude-hooks/`](./tooling/scripts/claude-hooks/README.md), except `graph-hint`, which lives
with the [graph scripts](./tooling/scripts/graphify/README.md) because it changes with them. They run for
everybody, in every session, which is why they are the part that does not depend on an agent choosing to
comply.

| Hook                 | When                      | What it does                                                                                               |
| -------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `remind-skills`      | Before a write or an edit | Names the skills that govern that path, and the comment rule on a source file. Once per session each       |
| `graph-hint`         | Before a search           | Says whether a code graph exists to query instead of grepping                                              |
| `guard-bash`         | Before a shell command    | Denies `--no-verify`, `LEFTHOOK=0` and a push that lands on `main`; injects the template on `gh pr create` |
| `check-written-file` | After a write or an edit  | Runs markdownlint, cspell, Prettier, the frontmatter check and the comment report on that file             |

`{"disableAllHooks": true}` in a git-ignored `.claude/settings.local.json` turns them off for your clone,
which is a choice you make for yourself and not for the repository.

## Related

- [`CLAUDE.md`](./CLAUDE.md): the rules no tool can check, and what is enforced for you
- [`.claude/`](./.claude/README.md): the files themselves, and how to add one
- [`.claude/skills/README.md`](./.claude/skills/README.md): provenance, licenses, refresh commands, and what was left out
- [`CONTRIBUTING.md`](./CONTRIBUTING.md): the flow these commands implement
