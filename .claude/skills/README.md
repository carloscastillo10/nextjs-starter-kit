# Project skills

Agent skills that Claude Code loads for everyone who opens this repository. Each folder is a third-party skill copied verbatim by the [`skills` CLI](https://github.com/vercel-labs/skills). `skills-lock.json` at the repository root records the source and a content hash for each one.

Only official skills for this template's stack are vendored here. Personal or aesthetic skills belong in your user-level `~/.claude/skills/`.

## Installed skills

| Skill | Source | Commit at install | Version | License | Use it for |
| --- | --- | --- | --- | --- | --- |
| `shadcn` | [shadcn/ui](https://github.com/shadcn/ui) | `a87a63b` | - | MIT | Adding, composing and theming shadcn/ui components |
| `clerk-setup` | [clerk/skills](https://github.com/clerk/skills) | `7523bd3` | 2.5.1 | MIT | Adding Clerk to the app, keys and environment |
| `clerk-nextjs-patterns` | [clerk/skills](https://github.com/clerk/skills) | `7523bd3` | 2.2.0 | MIT | Clerk with the Next.js App Router: proxy, server auth, route protection |
| `clerk-custom-ui` | [clerk/skills](https://github.com/clerk/skills) | `7523bd3` | 2.3.0 | MIT | Clerk appearance and custom flows, matched to the shadcn/ui theme |
| `feature-sliced-design` | [feature-sliced/skills](https://github.com/feature-sliced/skills) | `fd71da4` | FSD 2.1 | MIT | Deciding where code lives, layers, slices and public APIs |
| `vercel-react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | 1.0.0 | MIT | React and Next.js performance rules when writing or reviewing code |
| `vercel-composition-patterns` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | 1.0.0 | MIT | Component API design: composition over boolean props, compound components |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | `063bee9` | 1.0.0 | MIT | Accessibility and UX review of UI code (fetches the guidelines at run time) |
| `turborepo` | [vercel/turborepo](https://github.com/vercel/turborepo) | `f21d73f` | 2.10.14-canary.4 | MIT | `turbo.json` tasks, caching, filters and monorepo structure |

The license column reflects each source repository's README or the skill's own frontmatter. The copyright belongs to the respective authors.

## Restore, update or add

The folders here are the source of truth, so a fresh clone needs no install step. To refresh a skill from upstream, or to add a new one, run `add` from the repository root with Node 24. The command is idempotent: it overwrites the copy in `.claude/skills/<name>/` and updates `skills-lock.json`. The CLI version is pinned so results are reproducible.

```sh
npx -y skills@1.7.0 add <owner>/<repo> --skill <name> -a claude-code -y
```

Do not use `skills update` or `skills experimental_install`. In CLI 1.7.0 both move skills into `.agents/skills/` and leave symlinks, or nothing at all, in `.claude/skills/`. Claude Code only reads `.claude/skills/`, and symlinks break on Windows checkouts.

The original install commands, which also serve to refresh every skill, were:

```sh
npx -y skills@1.7.0 add shadcn/ui --skill shadcn -a claude-code -y
npx -y skills@1.7.0 add clerk/skills --skill clerk-setup clerk-nextjs-patterns clerk-custom-ui -a claude-code -y
npx -y skills@1.7.0 add feature-sliced/skills --skill feature-sliced-design -a claude-code -y
npx -y skills@1.7.0 add vercel-labs/agent-skills --skill vercel-react-best-practices vercel-composition-patterns web-design-guidelines -a claude-code -y
npx -y skills@1.7.0 add vercel/turborepo --skill turborepo -a claude-code -y
```

## Rules

- Do not edit files inside a skill folder by hand. Update through the CLI so the hash in `skills-lock.json` stays valid.
- These folders are vendored content. Some contain example `package.json`, `tsconfig.json`, `.ts` and `.tsx` files. Linters, formatters, spell checkers, the TypeScript compiler and the knowledge graph must ignore `.claude/`.
- Before adding a skill, check that it is official for a piece of this stack and that nothing already installed covers it.
