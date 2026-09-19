# ⚙️ features

> The features layer: a complete user interaction — its UI, its requests and its state — that several consumers share.

## 🎯 Purpose

A feature is an action a person takes: liking a post, adding to a cart, signing out. It is here rather than
in a page because more than one page performs it, and it carries everything that action needs so a consumer
renders one thing instead of assembling three.

**Extraction is a rule, not a judgement call.** Steiger fails a feature with a single consumer
(`fsd/insignificant-slice`), which is the same rule enforced by a tool.

## 🗂️ Structure

One folder per action, kebab-case, named after **the action rather than where it appears**: `like-post`,
`add-to-cart`, `sign-out` — never `header`.

```text
features/
└── like-post/             an example; the layer ships empty
    ├── api/
    │   └── toggle-like.ts
    ├── ui/
    │   └── LikeButton.tsx
    └── index.ts           export { LikeButton } from "./ui/LikeButton";
```

## 🚀 Usage

Imports:

- May import from `entities` and `shared`.
- Never from another feature, from `widgets`, from `_pages` or from `_app`. A page that needs two features
  composes both itself.

## 🧩 Extending

**Create a feature only when all three conditions hold:**

1. The same action is used in several places **right now**, not hypothetically.
2. It has a reason to change of its own, independent of any one page.
3. It has one focused responsibility.

Otherwise it stays in the page that uses it.

What does not belong here:

- **A domain model or rule several slices must agree on**: `entities`.
- **Plain CRUD requests or transport types**: `shared/api`.
- **Session plumbing for an authentication provider**: `shared/`, in a segment of its own.

## 🔗 Related

- [`entities/`](../entities/README.md): the models a feature acts on
- [`_pages/`](../_pages/README.md): where an action lives until a second page needs it
- [Feature-Sliced Design in `apps/web`](../../../../docs/architecture/feature-sliced-design.md): the full rules
