import { describe, expect, test } from "vitest";

import { ADR_STATUSES, classifyMarkdown, inspectFrontmatter } from "./frontmatter-rules.mjs";

const failuresIn = (text, file) =>
  inspectFrontmatter({ file, text }).failures.map(({ rule }) => rule);

const withFrontmatter = (body) => `---\n${body}\n---\n\n# Title\n`;

const VALID = withFrontmatter("tags: [conventions]\naliases: [Conventions]");

describe("classifyMarkdown", () => {
  test.each([
    "DESIGN.md",
    "CLAUDE.md",
    "AGENTS.md",
    "Home.md",
    "docs/conventions/code-style.md",
    "docs/adr/0001-use-turborepo.md",
    "docs/knowledge/obsidian-setup.md",
  ])("requires frontmatter in %s", (file) => {
    expect(classifyMarkdown(file).kind).toBe("required");
  });

  test.each([
    "README.md",
    "CONTRIBUTING.md",
    "docs/README.md",
    "docs/knowledge/README.md",
    "docs/adr/README.md",
    "tooling/scripts/graphify/README.md",
    "apps/web/src/shared/README.md",
  ])("forbids frontmatter in %s", (file) => {
    expect(classifyMarkdown(file).kind).toBe("forbidden");
  });

  test.each([
    ".claude/skills/shadcn/SKILL.md",
    ".claude/agents/tooling-agent.md",
    ".claude/commands/spec.md",
    ".claude/worktrees/feature-1/notes.md",
    ".github/pull_request_template.md",
    ".github/ISSUE_TEMPLATE/bug.md",
    ".graphify/obsidian/index.md",
    ".agents/rules/style.md",
    "apps/web/AGENTS.md",
    "apps/web/CLAUDE.md",
    "CHANGELOG.md",
    "LICENSE.md",
    "node_modules/some-package/readme.md",
    "apps/web/node_modules/x/docs/guide.md",
  ])("ignores %s", (file) => {
    expect(classifyMarkdown(file).kind).toBe("ignored");
  });

  test.each(["packages/ui/src/components/notes.md", "turbo/generators/templates/doc.md"])(
    "leaves %s alone either way",
    (file) => {
      expect(classifyMarkdown(file).kind).toBe("optional");
    },
  );

  test("asks an architecture decision record for its status", () => {
    expect(classifyMarkdown("docs/adr/0001-use-turborepo.md").needsStatus).toBe(true);
  });

  test("asks no status of a document outside the decision records", () => {
    expect(classifyMarkdown("docs/conventions/code-style.md").needsStatus).toBe(false);
  });

  test("asks no status of the index of the decision records", () => {
    expect(classifyMarkdown("docs/adr/README.md").needsStatus).toBe(false);
  });

  test("reads a Windows path the same way", () => {
    expect(classifyMarkdown("docs\\conventions\\code-style.md").kind).toBe("required");
  });
});

describe("inspectFrontmatter, where a document needs one", () => {
  const file = "docs/conventions/code-style.md";

  test("accepts tags and aliases", () => {
    expect(failuresIn(VALID, file)).toEqual([]);
  });

  test("accepts an empty alias list", () => {
    expect(failuresIn(withFrontmatter("tags: [conventions]\naliases: []"), file)).toEqual([]);
  });

  test("accepts the keys a design token document adds", () => {
    const text = withFrontmatter(
      'tags: [design-system]\naliases: [Design system]\nversion: alpha\ncolors:\n  background: "oklch(1 0 0)"',
    );

    expect(failuresIn(text, "DESIGN.md")).toEqual([]);
  });

  test("rejects a document with no block", () => {
    expect(failuresIn("# Title\n", file)).toEqual(["missing"]);
  });

  test("rejects a block that never closes", () => {
    expect(failuresIn("---\ntags: [a]\n\n# Title\n", file)).toEqual(["missing"]);
  });

  test("rejects a block that is not valid YAML", () => {
    expect(failuresIn(withFrontmatter("tags: [a\naliases: ["), file)).toEqual(["invalid-yaml"]);
  });

  test("rejects a block that is not a mapping", () => {
    expect(failuresIn(withFrontmatter("- tags\n- aliases"), file)).toEqual(["invalid-yaml"]);
  });

  test("rejects missing tags", () => {
    expect(failuresIn(withFrontmatter("aliases: [Conventions]"), file)).toEqual(["tags"]);
  });

  test("rejects an empty tag list", () => {
    expect(failuresIn(withFrontmatter("tags: []\naliases: []"), file)).toEqual(["tags"]);
  });

  test("rejects tags written as a string", () => {
    expect(failuresIn(withFrontmatter("tags: conventions\naliases: []"), file)).toEqual(["tags"]);
  });

  test("rejects a blank tag", () => {
    expect(failuresIn(withFrontmatter('tags: ["", conventions]\naliases: []'), file)).toEqual([
      "tags",
    ]);
  });

  test("rejects missing aliases", () => {
    expect(failuresIn(withFrontmatter("tags: [conventions]"), file)).toEqual(["aliases"]);
  });

  test("rejects aliases written as a string", () => {
    expect(failuresIn(withFrontmatter("tags: [a]\naliases: Conventions"), file)).toEqual([
      "aliases",
    ]);
  });

  test("reports every problem of one block at once", () => {
    expect(failuresIn(withFrontmatter("title: Conventions"), file)).toEqual(["tags", "aliases"]);
  });
});

describe("inspectFrontmatter, on an architecture decision record", () => {
  const file = "docs/adr/0001-use-turborepo.md";

  test.each([...ADR_STATUSES])("accepts the status %s", (status) => {
    const text = withFrontmatter(`tags: [adr]\naliases: [ADR 1]\nstatus: ${status}`);

    expect(failuresIn(text, file)).toEqual([]);
  });

  test("rejects a missing status", () => {
    expect(failuresIn(VALID, file)).toEqual(["status"]);
  });

  test("rejects a status outside the set", () => {
    const text = withFrontmatter("tags: [adr]\naliases: [ADR 1]\nstatus: draft");

    expect(failuresIn(text, file)).toEqual(["status"]);
  });
});

describe("inspectFrontmatter, where a document must not carry one", () => {
  test("rejects a README with frontmatter", () => {
    expect(failuresIn(VALID, "docs/README.md")).toEqual(["unwanted"]);
  });

  test("accepts a README without one", () => {
    expect(failuresIn("# Title\n", "docs/README.md")).toEqual([]);
  });

  test("accepts a README whose first line is a horizontal rule further down", () => {
    expect(failuresIn("# Title\n\n---\n\nMore.\n", "docs/README.md")).toEqual([]);
  });
});

describe("inspectFrontmatter, where the choice is free", () => {
  test.each(["packages/ui/src/notes.md", ".claude/agents/tooling-agent.md"])(
    "says nothing about %s",
    (file) => {
      expect(failuresIn(VALID, file)).toEqual([]);
      expect(failuresIn("# Title\n", file)).toEqual([]);
    },
  );
});

describe("the message of a failure", () => {
  test("names what to write", () => {
    const [failure] = inspectFrontmatter({ file: "docs/a.md", text: "# Title\n" }).failures;

    expect(failure.message).toContain("tags");
    expect(failure.message).toContain("aliases");
  });

  test("names the statuses a decision record may carry", () => {
    const { failures } = inspectFrontmatter({ file: "docs/adr/0001-a.md", text: VALID });

    expect(failures[0].message).toContain("accepted");
  });
});
