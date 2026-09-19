# 🗃️ entities

> The entities layer: the business models and rules the product enforces on its own data, shared by several slices.

## 🎯 Purpose

An entity is a noun of the domain — a product, an order, an invoice — together with the rules that have to
mean the same thing wherever it appears. "Is this product on sale" answered in two places, differently, is
the bug this layer exists to prevent.

**Starting without this layer is valid Feature-Sliced Design**, and most applications should. It earns its
place the first time two slices need to agree.

## 🗂️ Structure

One folder per model, kebab-case, a singular noun: `product`, `order`, `invoice`.

```text
entities/
  product/
    model/product.ts  <- the Product type and the isOnSale rule
    index.ts
```

## 🚀 Usage

Imports:

- May import from `shared` only.
- **Entities do not import each other.** Two entities that always change together are one entity. When the
  dependency truly cannot be removed, the other entity exposes a cross-import API with the `@x` notation —
  `entities/order/@x/customer.ts`, imported only by `entities/customer` — and that is a last resort with a
  comment explaining why.

UI inside an entity is allowed and risky: it invites cross-imports. Import it from `features`, `widgets`,
`_pages` or `_app`, never from another entity.

## 🧩 Extending

**Create an entity only when the extraction rule holds**: several slices use the model now, it changes for
reasons of its own, and it has one focused responsibility.

What does not justify one:

- **Authentication data.** Tokens and session helpers are infrastructure and go in `shared/`. Do not create a
  `user` entity only to wrap the response of a sign-in.
- **CRUD requests.** They are infrastructure: `shared/api`, or the one slice that calls them.
- **Transport types.** They stay in `shared/api` even after an entity starts using them.

## 🔗 Related

- [`shared/`](../shared/README.md): where infrastructure goes instead
- [`features/`](../features/README.md): the actions performed on these models
- [Feature-Sliced Design in `apps/web`](../../../../docs/architecture/feature-sliced-design.md): the full rules
