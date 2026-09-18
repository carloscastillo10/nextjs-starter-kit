# `entities`: entities layer

Reusable business domain models: the types and rules the product enforces on its own data, shared by several slices. Starting without this layer is valid FSD.

## When to create an entity

Only when the extraction rule holds: several slices use the model now, it changes for reasons of its own, and it has one focused responsibility. A rule that two pages must keep consistent (for example "is this product on sale") is the usual trigger.

Things that do not justify an entity:

- Auth data. Tokens and session helpers go to `shared/auth`; do not create a `user` entity only to wrap a login response.
- CRUD requests. They are infrastructure and go to `shared/api` (or stay in the one slice that calls them).
- Transport types (DTOs). They stay in `shared/api` even after an entity starts using them.

## Imports

- May import from `shared` only.
- Entities do not import each other. Merge entities that always change together. If the dependency cannot be removed, the other entity exposes a dedicated cross-import API with the `@x` notation (`entities/order/@x/customer.ts`, imported only by `entities/customer`). Treat it as a last resort and explain why in a comment.

## UI in entities

Allowed but risky: entity UI invites cross-imports. Only import it from `features`, `widgets`, `_pages` or `_app`, never from another entity.

## Slice naming

kebab-case singular noun: `product`, `order`, `invoice`.

```text
entities/
  product/
    model/product.ts  <- Product type and the isOnSale rule
    index.ts
```

See [the architecture guide](../../../../docs/architecture/feature-sliced-design.md) for the full rules.
