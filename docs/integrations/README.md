# 🔌 Integrations

> One guide per third-party service the template is wired to: what is set up, where the keys go, and the pitfalls found while wiring it.

## 🎯 Purpose

The code shows how a service is called; these guides cover what the code cannot: creating the account or instance, which keys to copy and where, what changes between development and production, and the behavior that surprised us, each pitfall with the date it was checked and the source.

## 🗂️ Structure

| Guide                  | Service                                                      |
| ---------------------- | ------------------------------------------------------------ |
| [clerk.md](./clerk.md) | Clerk: authentication, the route protection policy, env keys |

## 🧩 Extending

Add one Markdown file per service, named after it in kebab-case (`stripe.md`), with the same `tags` and `aliases` header as `clerk.md`, and list it in the table above. Record a pitfall with the date you verified it and a link to the page or changelog entry that explains it, so the next reader can tell whether it still holds.

## 🔗 Related

- [`@repo/env`](../../packages/env/README.md): where every service's variables are declared and validated
- [Architecture](../architecture/README.md): where integration code lives in the app
