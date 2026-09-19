## 🎯 What this changes

Closes #

---

## 🧪 How it was verified

```console

```

---

## 🧠 What this branch learned

---

## ✅ Before review

> [!IMPORTANT]
> The git hooks and CI run the same checks, so skipping a hook only moves the failure to the
> pull request. A box left unchecked below is worth more than a wrongly ticked one: say what
> you did not run and why, and a reviewer can weigh that.

### Always

- [ ] The title is `type(scope): <gitmoji> Message`, 50 characters or fewer, because it becomes the commit on `main`
- [ ] The base branch is `main`
- [ ] `pnpm gates` passes locally, and anything it reported is accounted for above
- [ ] The git hooks ran on every commit, or this description says which were skipped and why
- [ ] `/doc-review` and `code-steward` both ran, and every finding is fixed here or filed as an issue
- [ ] Every acceptance criterion in the issue is met, or the ones left are listed above
- [ ] No secrets, `.env` files or machine-specific paths in the diff

### When it applies

Strike a line through one that does not, rather than deleting it, so a reviewer sees it was considered.

- [ ] A `README.md` this change outdates is updated **in this branch**
- [ ] A decision that is hard to reverse is recorded as an ADR, linked above
- [ ] `DESIGN.md` and the theme tokens changed together, because one describes the other
- [ ] `.env.example` was re-emitted with `pnpm env:emit`, because an environment schema changed
- [ ] A convention or spec this contradicts is reconciled rather than left to drift

<details>
<summary><b>Why these four sections, and not a summary of the diff</b></summary>

<br>

**The diff is already on the Files tab.** These sections carry what it cannot.

| Section                         | Answers                                                  |
| ------------------------------- | -------------------------------------------------------- |
| 🎯 **What this changes**        | why a reviewer should want this merged                   |
| 🧪 **How it was verified**      | whether to trust it, with evidence rather than assurance |
| 🧠 **What this branch learned** | what the next person should not rediscover               |
| ✅ **Before review**            | which gates ran, and which were considered and skipped   |

**`Closes #<issue>` is load-bearing.** It closes the issue when this merges, and
`assign-on-open.yml` reads the same keyword to give the issue an owner, which GitHub does not do
by itself. Leaving the number off costs both.

**"Nothing new" is a valid answer** in the third section and the required one when the branch
taught nothing. An empty section reads as a step that was skipped. The flow this sits inside is
[`CONTRIBUTING.md`](../blob/main/CONTRIBUTING.md).

</details>
