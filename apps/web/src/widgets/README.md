# 🧱 widgets

> The widgets layer, deliberately empty: large UI blocks several pages share, and the reasons you probably want something else.

## 🎯 Purpose

Feature-Sliced Design v2.1 **recommends against adopting this layer.** A real UI block carries data fetching,
state and event handling, so its boundary with `features` blurs and both end up holding half of the same
thing.

The folder exists so all six standard layers are visible and the decision is a decision rather than an
omission. Keep it empty unless the three conditions below hold.

## 🗂️ Structure

One folder per block, kebab-case, named after the block:

```text
widgets/
  dashboard-sidebar/
    ui/DashboardSidebar.tsx
    index.ts
```

## 🚀 Usage

Imports:

- May import from `features`, `entities` and `shared`.
- Never from another widget, from `_pages` or from `_app`.

## 🧩 Extending

**Before creating a widget**, put the block where it belongs instead:

| The block is                                  | It goes in                             |
| --------------------------------------------- | -------------------------------------- |
| Composition used by one screen                | That `_pages` slice                    |
| A reused user action and the UI to perform it | `features`                             |
| UI with no business context                   | `shared/ui`, or the `@repo/ui` package |
| App-wide layout or chrome                     | `_app/layouts`                         |

**A widget is justified when all three hold:**

1. Several pages render the same block today.
2. The block composes two or more features or entities.
3. Wiring those features from each page, through props or slots, would duplicate logic that is not trivial.

A dashboard sidebar that several dashboard pages render, combining navigation, a user menu and
notifications, is the typical case.

## 🔗 Related

- [`features/`](../features/README.md): where a reused action goes instead
- [`src/`](../README.md): the six layers and the import rule between them
- [Feature-Sliced Design in `apps/web`](../../../../docs/architecture/feature-sliced-design.md): the full rules
