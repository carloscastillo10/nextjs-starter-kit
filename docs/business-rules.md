---
tags: [business-rules, governance, moc]
aliases: [Business Rules, Cross-cutting rules, BR catalog]
---

# 📏 Business rules

The catalog of rules that **every feature inherits**, whether or not its spec restates them. A rule is here
when breaking it in one screen would be a bug in the product rather than a bug in that screen.

> [!NOTE]
> This file ships as a seed. The template has no product and therefore no rules; the one entry below is an
> example of the shape, marked as such, and it is deleted when the first real rule arrives. Everything that
> reads this file — [`doc-steward`](../.claude/agents/doc-steward.md), `/doc-review`, `/spec`, `/feature` —
> treats an empty catalog as an empty catalog, not as an error.

## What belongs here

| It goes here                                          | It goes elsewhere                                                                  |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| A rule that more than one feature has to obey         | A rule for one screen → that screen's [spec](specs/README.md)                      |
| A rule about what the product does                    | A rule about how code is written → [conventions](conventions/README.md)            |
| A rule somebody would otherwise re-decide per feature | A choice between two ways of building → an [ADR](adr/README.md)                    |
| A rule whose violation is a defect, not a preference  | A description of how the system is shaped → [architecture](architecture/README.md) |

The test that keeps the catalog small: **if a new feature could reasonably contradict it without anyone
noticing, it is a business rule.** If nothing would contradict it, it is a description, and descriptions
belong in the architecture guide.

## Numbering

`BR-01`, `BR-02`, and so on, two digits, assigned in the order rules are added and **never reused**. A rule
that stops holding keeps its number and is marked so, because specs, issues and commits point at numbers.

## The catalog

| ID                                       | Rule                | One line                                            |
| ---------------------------------------- | ------------------- | --------------------------------------------------- |
| [BR-01](#br-01--an-example-of-the-shape) | Example, not a rule | Delete this row when the first real rule is written |

## BR-01 — An example of the shape

> [!IMPORTANT]
> This is the template for an entry, not a rule this product has. Replace it.

State the rule in one bold sentence, in the present tense, as something the product does or refuses to do.
Then, in a sentence or two, say what it protects and where it would be tempting to break it.

- **Why:** the reason the rule exists, which is the part that survives when the implementation changes.
- **Applies to:** the specs, screens or services that inherit it.
- **Enforced by:** the check, the test or the review step that catches a violation — or "review only", which
  is an honest answer and a reason to look for a check.

## Adding one

1. Take the next number, add a row to the catalog table, and write the section below it with the same three
   bullets.
2. Say where it came from: a spec, an incident, a decision. A rule with no origin gets argued about again.
3. If a tool can catch a violation, wire the check in the same change and name it under **Enforced by**.
4. When a rule stops holding, keep the section, mark it in its first line, and say which rule replaced it.
