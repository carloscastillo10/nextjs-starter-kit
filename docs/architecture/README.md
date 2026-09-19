# Architecture

How the code of this repository is organized: where things live, which modules may depend on which, and how those rules are checked.

## Documents

- [feature-sliced-design.md](feature-sliced-design.md): Feature-Sliced Design in `apps/web`. Layers, import rules, public APIs, naming, Next.js integration, where workspace packages fit, the FSD roots and how layers are shared between apps, placement tables and the Steiger linter.
- [architecture-checks.md](architecture-checks.md): the four checks that guard the structure, what each one owns, how to read a failure and how to add a rule without reporting a violation twice.

## Adding a document

Write one Markdown file per topic, named in kebab-case after the topic (`data-fetching.md`, not `notes.md`), and add it to the list above. Describe the rules as they are in the code today. Decision records with context and alternatives belong in an ADR, not here.
