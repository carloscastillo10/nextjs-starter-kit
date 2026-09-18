---
tags: [claude-code, skills, licenses, third-party]
aliases: [Third-party notices, Skill licenses]
---

# 📜 Third-party notices

> Copyright and license notices for the agent skills vendored in this folder.

Every folder next to this file is a verbatim copy of a third-party skill, redistributed under the license its author chose. This file keeps those notices with the copies, as the licenses require. The copyright stays with each author.

Plugins declared in [`../settings.json`](../settings.json) are not copied into this repository. Claude Code downloads them from their own source, under their own license, so they are not listed here.

## 🗂️ Notices

| Skill folders | Source | License | Copyright notice |
| --- | --- | --- | --- |
| `shadcn` | [shadcn/ui](https://github.com/shadcn/ui) | MIT | Copyright (c) 2023 shadcn |
| `clerk-setup`, `clerk-nextjs-patterns`, `clerk-custom-ui` | [clerk/skills](https://github.com/clerk/skills) | MIT | Declared in the upstream README and in each skill's frontmatter. The repository ships no LICENSE file with a copyright line. |
| `feature-sliced-design` | [feature-sliced/skills](https://github.com/feature-sliced/skills) | MIT | Declared in the upstream README. The repository ships no LICENSE file with a copyright line. |
| `vercel-react-best-practices`, `vercel-composition-patterns`, `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | MIT | Declared in the upstream README and in the frontmatter of two of the skills. The repository ships no LICENSE file with a copyright line. |
| `turborepo` | [vercel/turborepo](https://github.com/vercel/turborepo) | MIT | Copyright (c) 2026 Vercel, Inc |
| `design-md` | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | MIT | Copyright (c) 2025 Nous Research |
| `stop-slop` | [hardikpandya/stop-slop](https://github.com/hardikpandya/stop-slop) | MIT | Copyright (c) 2025 Hardik Pandya (its `LICENSE` file is also inside the folder) |
| `tailwind-css` | [paulrberg/agent-skills](https://github.com/paulrberg/agent-skills) | MIT | Copyright (c) 2025 Paul Razvan Berg |

## 📄 MIT License

Every source above uses the MIT License. Its permission notice, which applies to each copyright notice in the table:

```text
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🔗 Related

- [Project skills](./README.md): what each skill is for and how to refresh it.
- [`skills-lock.json`](../../skills-lock.json): the source and content hash of each vendored skill.
