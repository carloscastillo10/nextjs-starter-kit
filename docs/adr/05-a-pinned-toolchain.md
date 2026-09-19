---
tags: [adr, toolchain, pnpm, nodejs, typescript]
aliases: [ADR 05, Pinned toolchain]
status: accepted
---

# The toolchain is pinned, and the package manager refuses a wrong version

Node.js is `24.18.0` in [`.nvmrc`](../../.nvmrc), pnpm is `11.17.0` in the `packageManager` field of the root
`package.json`, and every workspace declares `engines` of `node >=24.18.0 <25` and `pnpm >=11.17.0 <12`.
TypeScript is `~6.0.3`, a patch range rather than a caret one. `engineStrict: true` lives in
[`pnpm-workspace.yaml`](../../pnpm-workspace.yaml), which is what turns those ranges into a refusal rather
than a warning: an install on the wrong Node.js stops with `ERR_PNPM_UNSUPPORTED_ENGINE`.

Two versions are exact rather than ranges, for the same reason in both cases: the output changes without the
API changing. Prettier is `3.9.7`, because a formatting change in a patch release rewrites files that were
already correct. TypeScript stays on `6.0.x` because typescript-eslint declares `typescript <6.1.0` and
TypeScript 7 ships without the compiler API the typed rules call.

## Considered options

**A floating major** (`.nvmrc` with `24`, `engines` with `>=24`). Rejected: two machines then run different
minors, and the difference shows up as a test that passes on one of them. A version manager reads the exact
number for free.

**`engine-strict=true` in `.npmrc`.** Rejected because it does nothing: pnpm 11 reads authentication and
registry settings from `.npmrc` and takes this one from `pnpm-workspace.yaml`. Measured both ways — with the
`.npmrc` line the install succeeded on an unsupported Node.js, with the workspace setting it failed.

**TypeScript 7.** Rejected for now, and revisited when typescript-eslint supports it: the typed lint rules are
a large share of the standard in [`../conventions/code-style.md`](../conventions/code-style.md), and losing
them costs more than the compiler gains.

## Consequences

- `corepack enable pnpm` is a required first step, once per Node.js version. Without it the global pnpm runs
  instead, and this repository never uses pnpm 10.
- A dependency whose own `engines` exclude this Node.js fails the install rather than being installed and
  breaking later.
- Bumping Node.js means editing `.nvmrc`, both `engines` ranges and the badge row in the root
  [`README.md`](../../README.md), in one commit. CI reads `.nvmrc`, so it follows by itself.
