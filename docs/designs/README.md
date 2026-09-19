# 🎨 Designs

> What a designer handed over: screens, states, and what changed between one drop and the next.

## 🎯 Purpose

[`DESIGN.md`](../../DESIGN.md) at the repository root is the design **system**: the tokens, what each one
means, and how to change the brand. It is small, it is linted, and it describes the values the stylesheets
define.

This folder is the other half: the **handoff**. Which screens exist, which states each one has, what the
designer meant by a spacing that does not match a token, and what a new drop changed. That material is long,
it arrives in batches, and it would bury `DESIGN.md` if it lived there.

The template ships it empty, because a template has no product to design.

## 🗂️ Structure

One file per drop or per subject, `YYYY-MM-DD-<topic>.md` for a dated handoff and `<topic>.md` for a document
that is maintained rather than received.

| File                   | Holds                                                                           |
| ---------------------- | ------------------------------------------------------------------------------- |
| `screen-map.md`        | Every screen and sub-state that exists, and the path a person takes to reach it |
| `YYYY-MM-DD-<drop>.md` | What arrived that day, what was applied, and what was deliberately not applied  |

Binary files — exports, screenshots, PDFs — stay out of git unless they are small and load-bearing. Link the
source of truth in the design tool instead, and write down what it says.

## 🚀 Usage

Read the screen map before asking whether a state exists. When applying a drop:

1. Check the values against the tokens in [`DESIGN.md`](../../DESIGN.md). A color or a radius that is not a
   token is either a missing token or a mistake in the design, and both are worth a question.
2. Change the token, in [`tooling/tailwind/theme.css`](../../tooling/tailwind/README.md), never the component.
   The lint rules reject arbitrary Tailwind values in app code for exactly this reason.
3. Update `DESIGN.md` in the same commit as the token. The two are one change.

## 🔁 How it updates

A drop is written down when it arrives, not when it is applied, so that what was received and what was built
can still be told apart. `doc-steward` reports a diff that changes tokens or theme usage without touching
`DESIGN.md`; nothing can report a design that was never written down.

A superseded drop moves to [`../archive/`](../archive/README.md).

## 🧩 Extending

- **Describe, do not decide.** A design document records what the design says. A choice between two designs
  is a [decision](../adr/README.md); what the product must do is a [spec](../specs/README.md).
- **Name the token, not the hex value**, whenever a token exists. A hex value written twice is a hex value
  that will disagree with itself.
- **Accessibility is part of the handoff.** Record the contrast ratio a color pair was checked at, so that a
  later tweak is visibly a regression.

## 🔗 Related

- [DESIGN.md](../../DESIGN.md): the tokens themselves, and how to change the brand
- [@repo/tailwind-config](../../tooling/tailwind/README.md): where the tokens are defined
- [@repo/ui](../../packages/ui/README.md): the components that consume them
- [React conventions](../conventions/react.md): styling rules, and the UI kit first
