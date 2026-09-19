---
tags: [adr, authentication, scope]
aliases: [ADR 09, No authentication in the template]
status: accepted
---

# The template ships without authentication

There is no authentication provider here: no client library, no sign-in routes, no session helpers, no proxy
that checks a session. What the template ships instead is **the place each of those goes**, written down in
[`../architecture/feature-sliced-design.md`](../architecture/feature-sliced-design.md), and an environment
package that validates whatever variables the provider turns out to need.

Authentication is the decision a product makes earliest and changes least, and every provider wants the
application shaped slightly differently — where the middleware runs, whether the provider owns the sign-in
screens, whether roles live in its tables or yours. A template that picks one leaves everybody else deleting
code before writing any, and deleting an integration is harder than adding one: the parts that are easy to
miss are the environment variables, the CI secrets and the lint exceptions, not the components.

## Considered options

**Ship one provider, fully wired.** Rejected: it is the strongest opinion a starter can hold, and it is the
one its users are most likely to disagree with. It also dates fastest — the client library that ships today
is a major version behind within a year.

**Ship an abstraction over several providers.** Rejected: an interface with one implementation is an
interface written from one example. Every provider that came later would either fit badly or force the
abstraction to change.

**Ship a fake local session** so the app has a signed-in state to demonstrate. Rejected: the template ships no
demo content at all, and a fake session is demo content that looks like infrastructure.

## Consequences

- `pnpm dev` serves a public application with no session anywhere, and that is the intended state.
- Adding a provider means: its variables in a schema in [`@repo/env`](../../packages/env/README.md) followed
  by `pnpm env:emit`; the provider component in `src/_app/providers/`; its screens as `_pages` slices; a guide
  in [`../integrations/`](../integrations/README.md); and its own official agent skills, added the way
  [`.claude/skills/README.md`](../../.claude/skills/README.md) describes.
- Route protection is then a decision for that product. The guidance the architecture guide gives is to check
  the session in the resource — the page, the Route Handler, the Server Action — rather than in the proxy,
  because a proxy that decides access grants it by default to every route nobody remembered to list.
