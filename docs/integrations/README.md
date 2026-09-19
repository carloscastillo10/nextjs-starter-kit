# 🔌 Integrations

> One guide per external service this product depends on: what it is for, and the traps you already paid for.

## 🎯 Purpose

A vendor's own documentation says what the API can do. It never says what went wrong the first time, which
field is a lie, or which of two endpoints the team settled on. That is what a guide here holds, so the next
person does not rediscover it.

The template **ships with no integrations**, because it has no vendors: no authentication provider, no
payments, no email. The folder exists so that the first one has a place, and so the shape of the first guide
is not invented under deadline.

## 🗂️ Structure

One file per service, named after the service in kebab-case: `stripe.md`, `resend.md`, `clerk.md`.

```md
---
tags: [integration, <service>]
aliases: [<Service>]
---

# <Service>

What it is, and why this product uses it rather than the alternative.

## What we use it for

## Setting it up

## How it is wired here

## Traps

## Links
```

**Traps is the section that earns the file.** One line each, with the date you learned it and the URL if the
vendor documents it at all: an endpoint whose documented status code is wrong, a webhook that arrives twice, a
sandbox that behaves differently from production.

## 🚀 Usage

Read the guide before touching the code that calls the service, and read
[`../architecture/feature-sliced-design.md`](../architecture/feature-sliced-design.md) for where that code
goes: a client belongs in `shared`, a provider in `_app/providers/`, and route-level checks in the resource
itself rather than in the proxy.

Every variable a service needs is declared in a schema in [`@repo/env`](../../packages/env/README.md), which
regenerates `.env.example`, so a guide never lists the variables a second time:

```bash
pnpm env:emit    # rewrite .env.example from the schemas
pnpm env:check   # fail if the committed example no longer matches them
```

## 🔁 How it updates

A guide is updated in the branch that discovers the change, never in a follow-up. When a vendor behaves
differently from its documentation, the line goes in **Traps** with the date, and
[`doc-steward`](../../.claude/agents/doc-steward.md) asks for it at review: "a third party behaves differently
from its documentation" is one of the things a diff cannot reveal on its own.

A service that is removed takes its guide to [`../archive/`](../archive/README.md), because the reasons it was
dropped are worth more than the file costs.

## 🧩 Extending

1. Add the service's variables to a schema in `packages/env/src/schemas/`, then `pnpm env:emit`.
2. Write the guide here, from the template above, and add it to the table in
   [`../README.md`](../README.md) if you keep an index of services there.
3. If the choice of vendor was a real trade-off, that is a [decision](../adr/README.md), not a guide.
4. If the vendor publishes agent skills, add them the way
   [`.claude/skills/README.md`](../../.claude/skills/README.md) describes, rather than summarizing their docs
   here.

## 🔗 Related

- [@repo/env](../../packages/env/README.md): where a service's variables are declared and validated
- [Feature-Sliced Design](../architecture/feature-sliced-design.md): where the code that calls a service lives
- [Decisions](../adr/README.md): why this vendor and not the other one
