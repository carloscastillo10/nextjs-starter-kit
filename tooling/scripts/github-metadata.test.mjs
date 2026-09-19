import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";
import { parse } from "yaml";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

const read = (file) => readFileSync(path.join(ROOT, file), "utf8");

const readYaml = (file) => parse(read(file));

const FORMS = ["bug", "feature"].map((name) => ({
  name,
  form: readYaml(`.github/ISSUE_TEMPLATE/${name}.yml`),
}));

const labels = readYaml(".github/labels.yml");

const fieldOf = (form, id) => form.body.find((field) => field.id === id);

describe("the labels an issue form asks for", () => {
  test.each(FORMS)("$name applies labels that are declared", ({ form }) => {
    const declared = labels.map(({ name }) => name);

    expect(form.labels.length).toBeGreaterThan(0);

    for (const label of form.labels) expect(declared).toContain(label);
  });

  test("the contributing guide creates every declared label", () => {
    const guide = read("CONTRIBUTING.md");

    for (const { name, color, description } of labels) {
      expect(guide).toContain(`gh label create ${name} --color ${color}`);
      expect(guide).toContain(description);
    }
  });

  test("every label the guide creates is declared", () => {
    const created = [...read("CONTRIBUTING.md").matchAll(/gh label create (?<name>\S+)/gu)].map(
      (match) => match.groups.name,
    );

    expect(created).toHaveLength(labels.length);

    for (const name of created) {
      expect(labels.some((label) => label.name === name)).toBe(true);
    }
  });
});

describe("the skills the feature form offers", () => {
  const skills = readdirSync(path.join(ROOT, ".claude/skills"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const plugins = Object.keys(JSON.parse(read(".claude/settings.json")).enabledPlugins ?? {}).map(
    (id) => id.split("@")[0],
  );

  const options = fieldOf(FORMS.find(({ name }) => name === "feature").form, "skills")
    .attributes.options.filter((option) => option.includes(" — "))
    .map((option) => option.split(" — ")[0].trim());

  test("names something a reader can load", () => {
    expect(options.length).toBeGreaterThan(0);

    for (const option of options) {
      const [name, marker] = option.split(" ");

      expect(marker === "(plugin)" ? plugins : skills).toContain(name);
    }
  });

  test("marks as a plugin exactly what is not vendored", () => {
    for (const option of options) {
      const [name, marker] = option.split(" ");

      expect(marker === "(plugin)").toBe(!skills.includes(name));
    }
  });
});

describe("the pull request template", () => {
  const template = read(".github/pull_request_template.md");

  test("carries the four sections the shell guard hands over", () => {
    const guard = read("tooling/scripts/hooks/guard-bash.mjs");
    const headings = [...template.matchAll(/^## (?<heading>.+)$/gmu)].map(
      (match) => match.groups.heading,
    );

    expect(headings).toHaveLength(4);

    for (const heading of headings) expect(guard).toContain(heading);
  });

  test("asks for the issue it closes, which is what gives that issue an owner", () => {
    expect(template).toContain("Closes #");
    expect(existsSync(path.join(ROOT, ".github/workflows/assign-on-open.yml"))).toBe(true);
  });
});
