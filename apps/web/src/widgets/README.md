# `widgets`: widgets layer (discouraged)

FSD v2.1 recommends against adopting this layer. Real UI blocks carry data fetching, state and event handling, so their boundary with `features` blurs. The folder exists so all six standard layers are visible; keep it empty unless the case below applies.

## Before creating a widget

Put the block where it belongs instead:

- Composition used by one screen: keep it in that `_pages` slice.
- A reused user action and the UI to perform it: `features`.
- UI with no business context: `shared/ui` or the `@repo/ui` package.
- App-wide layout or chrome: `_app/layouts`.

## When a widget is justified

All of these hold:

1. Several pages render the same block today.
2. The block composes two or more features or entities.
3. Wiring those features from each page (passing them in through props or slots) would duplicate non-trivial logic.

A dashboard sidebar that several dashboard pages render, combining navigation, a user menu and notifications, is the typical case.

## Imports

- May import from `features`, `entities` and `shared`.
- Never from another widget, `_pages` or `_app`.

## Slice naming

kebab-case, named after the block: `dashboard-sidebar`.

```text
widgets/
  dashboard-sidebar/
    ui/DashboardSidebar.tsx
    index.ts
```

See [the architecture guide](../../../../docs/architecture/feature-sliced-design.md) for the full rules.
