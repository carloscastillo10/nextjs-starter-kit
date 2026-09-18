---
tags: [claude-code, skills, plugins, agents]
aliases: [Project skills, Claude Code skills]
---

# 🧩 Project skills

> Agent skills and plugins that Claude Code loads for everyone who opens this repository.

![skills CLI](https://img.shields.io/badge/skills%20CLI-1.7.0-000000)
![vendored skills](https://img.shields.io/badge/vendored%20skills-11-2ea44f)
![declared plugins](https://img.shields.io/badge/declared%20plugins-3-D97757)

## 🧭 Table of contents

- [🎯 Purpose](#-purpose)
- [🗂️ Structure](#️-structure)
- [🚀 Usage](#-usage)
- [⌨️ Commands](#️-commands)
- [🔁 How it updates](#-how-it-updates)
- [🧩 Extending](#-extending)
- [🔗 Related](#-related)

## 🎯 Purpose

Give every contributor, human or agent, the same stack-aware guidance: shadcn/ui, Clerk, Feature-Sliced Design, React and Next.js, Turborepo, the web platform, the root `DESIGN.md` and the prose in the docs.

Two mechanisms, chosen per item:

- **Vendored skills** are copies of third-party skills with a permissive license, made by the [`skills` CLI](https://github.com/vercel-labs/skills). The folders are the source of truth, so a fresh clone needs no install step for them.
- **Declared plugins** come from Anthropic's official marketplace, `claude-plugins-official`. [`../settings.json`](../settings.json) turns them on for this repository; nothing is copied.

## 🗂️ Structure

### Vendored skills

| Skill | Source | Upstream commit | Version | License | Use it for |
| --- | --- | --- | --- | --- | --- |
| `shadcn` | [shadcn/ui](https://github.com/shadcn/ui) | `a87a63b` | - | MIT | Adding, composing and theming shadcn/ui components, toasts included |
| `clerk-setup` | [clerk/skills](https://github.com/clerk/skills) | `7523bd3` | 2.5.1 | MIT | Adding Clerk to the app, keys and environment |
| `clerk-nextjs-patterns` | [clerk/skills](https://github.com/clerk/skills) | `7523bd3` | 2.2.0 | MIT | Clerk with the Next.js App Router: proxy, server auth, route protection |
| `clerk-custom-ui` | [clerk/skills](https://github.com/clerk/skills) | `7523bd3` | 2.3.0 | MIT | Clerk appearance and custom flows, matched to the shadcn/ui theme |
| `feature-sliced-design` | [feature-sliced/skills](https://github.com/feature-sliced/skills) | `fd71da4` | FSD 2.1 | MIT | Deciding where code lives: layers, slices and public APIs |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | 1.0.0 | MIT | React and Next.js performance rules when writing or reviewing code |
| `vercel-composition-patterns` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | 1.0.0 | MIT | Component API design: composition over boolean props, compound components |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | 1.0.0 | MIT | Accessibility and UX review of UI code (fetches the guidelines at run time) |
| `turborepo` | [vercel/turborepo](https://github.com/vercel/turborepo) | `f21d73f` | 2.10.14-canary.4 | MIT | `turbo.json` tasks, caching, filters and monorepo structure |
| `design-md` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | `cae5c81` | 1.1.0 | MIT | Writing, linting and diffing the root `DESIGN.md` against [Google's DESIGN.md spec](https://github.com/google-labs-code/design.md) |
| `stop-slop` | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | `8da1f03` | - | MIT | Cutting filler and AI writing patterns from READMEs and docs |

The upstream commit is the repository HEAD at install time, or for the last two rows the latest commit that touched the skill's folder. Copyright notices live in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

### Declared plugins

| Plugin | Publisher | License | Installs | Use it for |
| --- | --- | --- | --- | --- |
| `superpowers@claude-plugins-official` | [obra/superpowers](https://github.com/obra/superpowers) | MIT | Once per person (external source) | The working method: brainstorm, plan, test first, debug, verify before done |
| `frontend-design@claude-plugins-official` | [Anthropic](https://github.com/anthropics/claude-plugins-official) | Apache-2.0 | With the marketplace (its source lives there) | Visual direction and interface copy when you build new pages |
| `modern-web-guidance@claude-plugins-official` | [Google Chrome](https://github.com/GoogleChrome/modern-web-guidance) | Apache-2.0 | Once per person (external source) | Current web platform practice: CSS layout, Core Web Vitals, forms and autofill, accessibility, browser support |

`modern-web-guidance` also brings a `chrome-extensions` skill for browser extension work. Settings cannot hide one skill of a plugin, so it stays listed.

### Files

| File | Role |
| --- | --- |
| `<skill>/` | One vendored skill each. Do not edit by hand. |
| [`THIRD_PARTY_NOTICES.md`](./THIRD_PARTY_NOTICES.md) | Copyright and license notices for the vendored skills |
| [`../settings.json`](../settings.json) | `enabledPlugins` for the declared plugins |
| [`../../skills-lock.json`](../../skills-lock.json) | Source, path and content hash of each vendored skill, written by the CLI |
| [`../../.mcp.json`](../../.mcp.json) | The Next.js DevTools MCP server |

## 🚀 Usage

Vendored skills load on their own. Claude picks one when its description matches the task, and you can call it by name, for example `/design-md`.

> [!IMPORTANT]
> Opening the repository does not install plugins from an external source. Run this once, from the repository root, after you clone it:
>
> ```sh
> claude plugin install superpowers@claude-plugins-official --scope project
> claude plugin install modern-web-guidance@claude-plugins-official --scope project
> claude plugin install frontend-design@claude-plugins-official --scope project
> ```
>
> Each command reports "already installed" when there is nothing to do, and `--scope project` matches what `.claude/settings.json` already declares, so the file does not change. Approve the `next-devtools` MCP server when Claude Code asks.

When two sources disagree, this order applies:

1. The rules in [`docs/conventions/`](../../docs/conventions/README.md) and the components of the UI kit. Toasts, dialogs, popovers and form controls come from the kit, even where `modern-web-guidance` shows a hand-built platform version.
2. `DESIGN.md` and the theme tokens in the global stylesheet. `frontend-design` works inside that direction; it does not replace it.
3. The skills and plugins listed here.

> [!NOTE]
> `DESIGN.md` documents the tokens that the global stylesheet defines, so change both together. Lint it with a pinned CLI version and keep exports such as `tokens.json` out of the repository.

## ⌨️ Commands

| Command | What it does |
| --- | --- |
| `npx -y skills@1.7.0 list` | Lists the vendored skills |
| `npx -y skills@1.7.0 add <owner>/<repo> --skill <name> -a claude-code -y` | Adds a skill, or refreshes it from upstream |
| `claude plugin validate .claude/skills` | Checks the frontmatter of every vendored skill |
| `claude plugin list` | Shows which declared plugins you have installed |
| `claude plugin details <plugin>@claude-plugins-official` | Shows a plugin's skills and their token cost |
| `claude plugin update <plugin>@claude-plugins-official` | Updates a plugin to the marketplace version |
| `npx -y @google/design.md@0.4.0 lint DESIGN.md` | Validates `DESIGN.md`: structure, token references, WCAG contrast |

## 🔁 How it updates

Vendored skills change only when someone refreshes them. Run `add` from the repository root with Node 24: it overwrites `.claude/skills/<name>/` and updates `skills-lock.json`, and running it twice gives the same result. The CLI version is pinned so the output is reproducible.

```sh
npx -y skills@1.7.0 add shadcn/ui --skill shadcn -a claude-code -y
npx -y skills@1.7.0 add clerk/skills --skill clerk-setup clerk-nextjs-patterns clerk-custom-ui -a claude-code -y
npx -y skills@1.7.0 add feature-sliced/skills --skill feature-sliced-design -a claude-code -y
npx -y skills@1.7.0 add vercel-labs/agent-skills --skill vercel-react-best-practices vercel-composition-patterns web-design-guidelines -a claude-code -y
npx -y skills@1.7.0 add vercel/turborepo --skill turborepo -a claude-code -y
npx -y skills@1.7.0 add hardikpandya/stop-slop -a claude-code -y
SKILLS_CLONE_TIMEOUT_MS=900000 npx -y skills@1.7.0 add NousResearch/hermes-agent --skill design-md -a claude-code -y
```

The last command clones a large repository and can take around ten minutes, hence the longer timeout.

> [!WARNING]
> Do not use `skills update` or `skills experimental_install`. In CLI 1.7.0 both move skills into `.agents/skills/` and leave symlinks, or nothing at all, in `.claude/skills/`. Claude Code only reads `.claude/skills/`, and symlinks break on Windows checkouts.

Declared plugins follow the official marketplace, which pins each external plugin to a commit. `claude plugin update` moves you to the version the marketplace currently lists.

## 🧩 Extending

A skill or plugin earns a place here when all four hold:

1. Someone building on this template would use it for work the stack produces.
2. It agrees with the stack and the conventions: shadcn/ui and its tokens and icons, `docs/conventions/`, and the Markdown style of the docs.
3. Nothing already listed covers the same ground better.
4. Its license allows redistribution (vendor it), or it comes from the official marketplace (declare it).

Also:

- Do not edit files inside a skill folder by hand. Refresh through the CLI so the hash in `skills-lock.json` stays valid.
- These folders contain example `package.json`, `tsconfig.json`, `.ts` and `.tsx` files. Linters, formatters, the spell checker, the TypeScript compiler and the knowledge graph must ignore `.claude/`.
- Add the copyright line of any new source to [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

> [!TIP]
> Toasts follow the shadcn/ui base: Base UI projects use the `toast` component, Radix and React Aria projects use Sonner. If the project runs on Sonner, add the guide from its author:
>
> ```sh
> npx -y skills@1.7.0 add emilkowalski/skills --skill ask-sonner -a claude-code -y
> ```

Left out on purpose, so they are not added back without a new reason:

| Candidate | Why it is not here |
| --- | --- |
| `ui-ux-pro-max` | Generates and persists its own design system in `design-system/*/MASTER.md`, a second source of truth next to `DESIGN.md`. Needs Python, and its script paths only resolve inside its plugin, which brings six more skills. |
| `design-taste-frontend`, `high-end-visual-design` | Discourage or ban the shadcn/ui defaults: `lucide-react`, Inter, `shadow-md`. |
| `minimalist-ui`, `industrial-brutalist-ui` | Each fixes one aesthetic; that choice belongs to the product built on the template. |
| `design-system` (claudekit) | A three-layer token model and slide generation that compete with the shadcn/ui theme. |
| `humanizer` | Removes emojis from headings, which the README style of this repository uses. |
| Vercel `writing-guidelines` | Flags single-word headings such as "Purpose" and "Usage", which the README style uses. |
| Material Design 3 skills | No official skill exists; the community ones target Jetpack Compose or Flutter first and replace the shadcn/ui tokens. |
| Google Stitch skills | Need a Stitch account and MCP server, and write `.stitch/DESIGN.md` in a format that drifts from the spec. |
| `context7` | A hosted documentation service; Next.js ships versioned docs and the vendored skills cover the rest. |
| `mattpocock-skills` | Test-first, debugging and review workflows that overlap Superpowers. |

## 🔗 Related

- [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md): licenses of the vendored skills.
- [Claude Code skills](https://code.claude.com/docs/en/skills) and [plugin settings](https://code.claude.com/docs/en/settings-reference#enabledplugins).
- [DESIGN.md specification](https://github.com/google-labs-code/design.md) from Google Labs.
- [Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance) from Chrome for Developers.
