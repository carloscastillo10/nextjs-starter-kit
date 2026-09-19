import { existsSync, readFileSync } from "node:fs";

import { describe, expect, test } from "vitest";

import { isCheckedSource } from "../comments/comment-rules.mjs";
import {
  findSkillRule,
  formatReminders,
  isCommentChecked,
  remindersFor,
  SKILL_RULES,
} from "./skill-rules.mjs";

const PROJECT_SKILLS = new URL("../../../.claude/skills/", import.meta.url);
const README = new URL("README.md", import.meta.url);

const readmeRules = () => {
  const section = readFileSync(README, "utf8")
    .split(/^#{2,4} /mu)
    .find((text) => text.startsWith("Rules, first match wins"));

  return (section ?? "")
    .split("\n")
    .filter((line) => /^\| `[\w-]+` +\|/u.test(line))
    .map((line) => line.split("|").map((cell) => cell.trim()))
    .map((cells) => ({
      id: cells[1].replaceAll("`", ""),
      skills: [...cells.at(-2).matchAll(/`([\w-]+)`/gu)].map(([, skill]) => skill),
    }));
};

describe("findSkillRule", () => {
  test.each([
    ["DESIGN.md", "design-md"],
    ["docs/conventions/react.md", "prose"],
    ["packages/ui/README.md", "prose"],
    ["apps/web/app/README.md", "prose"],
    ["turbo.json", "monorepo"],
    ["tooling/scripts/turbo.json", "monorepo"],
    ["pnpm-workspace.yaml", "monorepo"],
    ["packages/ui/package.json", "monorepo"],
    ["turbo/generators/config.ts", "monorepo"],
    ["tooling/tailwind/theme.css", "theme"],
    ["packages/ui/src/components/button.tsx", "ui-kit"],
    ["packages/ui/src/styles/globals.css", "ui-kit"],
    ["apps/web/components.json", "ui-kit"],
    ["apps/web/src/_app/styles/globals.css", "stylesheet"],
    ["apps/web/app/layout.tsx", "route-file"],
    ["apps/web/app/api/health/route.ts", "route-file"],
    ["apps/web/src/_pages/home/ui/HomePage.tsx", "app-ui"],
    ["apps/web/src/_app/metadata/site-url.ts", "app-code"],
  ])("%s goes to %s", (file, id) => {
    expect(findSkillRule(file)?.id).toBe(id);
  });

  test.each([
    "apps/web/next.config.ts",
    "packages/env/src/index.ts",
    "tooling/eslint/next.js",
    ".github/workflows/ci.yml",
    ".claude/skills/shadcn/SKILL.md",
    ".agents/skills/shadcn/SKILL.md",
    "apps/web/node_modules/next/dist/docs/index.md",
  ])("%s has no skill rule", (file) => {
    expect(findSkillRule(file)).toBeUndefined();
  });

  test("names only skills that ship with the project", () => {
    const missing = SKILL_RULES.flatMap(({ skills }) => skills).filter(
      (skill) => !existsSync(new URL(`${skill}/SKILL.md`, PROJECT_SKILLS)),
    );

    expect(missing).toEqual([]);
  });

  test("gives every rule its own id", () => {
    const ids = SKILL_RULES.map(({ id }) => id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("isCommentChecked", () => {
  test.each([
    "apps/web/src/_pages/home/ui/HomePage.tsx",
    "tooling/scripts/gates/run-gates.mjs",
    "commitlint.config.mjs",
    "packages/env/src/index.ts",
    "apps/web/next.config.ts",
    "apps/web/next-env.d.ts",
    "packages/ui/dist/index.js",
    ".claude/skills/shadcn/example.ts",
    "node_modules/some-package/index.cjs",
    "apps/web/.next/server/app.js",
    "DESIGN.md",
    "tooling/tailwind/theme.css",
  ])("agrees with the comment check on %s", (file) => {
    expect(isCommentChecked(file)).toBe(isCheckedSource(file));
  });
});

describe("remindersFor", () => {
  test("gives a component its skills first, then the comment rule", () => {
    const reminders = remindersFor("apps/web/src/_pages/home/ui/HomePage.tsx");

    expect(reminders.map(({ key }) => key)).toEqual(["app-ui", "comments"]);
    expect(reminders[0].text).toContain(
      "Load `feature-sliced-design`, `vercel-react-best-practices`, and " +
        "`vercel-composition-patterns` before you continue",
    );
    expect(reminders[1].text).toContain("Comments explain why, never what");
  });

  test("joins two skills with and", () => {
    const [reminder] = remindersFor("tooling/tailwind/theme.css");

    expect(reminder.text).toContain("Load `tailwind-css` and `design-md` before you continue");
  });

  test("gives a document its skill and no comment rule", () => {
    expect(remindersFor("docs/conventions/react.md").map(({ key }) => key)).toEqual(["prose"]);
  });

  test("speaks of one skill in the singular and of several in the plural", () => {
    const [single] = remindersFor("docs/conventions/react.md");
    const [several] = remindersFor("tooling/tailwind/theme.css");

    expect(single.text).toContain(
      "Load `stop-slop` before you continue, unless it is already loaded:",
    );
    expect(several.text).toContain("before you continue, unless they are already loaded:");
  });

  test("gives a source file no rule covers the comment rule alone", () => {
    expect(remindersFor("tooling/eslint/next.js").map(({ key }) => key)).toEqual(["comments"]);
  });

  test("has nothing for a file no rule covers", () => {
    expect(remindersFor(".github/workflows/ci.yml")).toEqual([]);
  });
});

describe("formatReminders", () => {
  test("opens with the file and closes with how often a reminder repeats", () => {
    const text = formatReminders("DESIGN.md", remindersFor("DESIGN.md"));

    expect(text.split("\n\n")).toEqual([
      "You are about to write DESIGN.md.",
      expect.stringContaining("Load `design-md` before you continue"),
      "Each reminder above appears once per session.",
    ]);
  });
});

describe("the hooks README", () => {
  test("lists every rule in order, with the skills it names", () => {
    expect(readmeRules()).toEqual(SKILL_RULES.map(({ id, skills }) => ({ id, skills })));
  });
});
