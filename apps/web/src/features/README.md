# `features`: features layer

Reusable user interactions. A feature is a complete action, with its UI, requests and state, that several consumers share.

## When to create a feature

Only when all three conditions of the extraction rule hold:

1. The same action is used in several places right now, not hypothetically.
2. It has a reason to change of its own, independent of any one page.
3. It has one focused responsibility.

Otherwise keep the code in the page that uses it. Steiger fails on a feature with a single consumer (`fsd/insignificant-slice`).

## What does not go here

- A domain model or rule that several slices must agree on: `entities`.
- Plain CRUD requests or transport types: `shared/api`.
- Authentication session plumbing: `shared/auth`.
- Imports from another feature. Let the page compose both features instead.

## Imports

- May import from `entities` and `shared`.
- Never from another feature, `widgets`, `_pages` or `_app`.

## Slice naming

kebab-case, named after the user action rather than where it appears: `like-post`, `add-to-cart`, `sign-out` (not `header`).

```text
features/
  like-post/
    ui/LikeButton.tsx
    api/toggle-like.ts
    index.ts          <- export { LikeButton } from "./ui/LikeButton";
```

See [the architecture guide](../../../../docs/architecture/feature-sliced-design.md) for the full rules.
