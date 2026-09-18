import { fileURLToPath } from "node:url";

import lint from "@commitlint/lint";
import load from "@commitlint/load";
import { describe, expect, test } from "vitest";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

const config = await load({}, { cwd: ROOT });

const failedRules = async (message, parserOptions = {}) => {
  const { errors } = await lint(message, config.rules, {
    defaultIgnores: config.defaultIgnores,
    parserOpts: { ...config.parserPreset.parserOpts, ...parserOptions },
    plugins: config.plugins,
  });

  return errors.map(({ name }) => name).sort();
};

describe("a message in the convention", () => {
  test.each([
    "feat(web): ✨ Add the settings page",
    "docs(designs): 📝 Record the badge and tile grey",
    "test(catalog): ✅ Fail the stock fake on demand",
    "refactor(repo): ♻️ Share one loader",
    "chore(repo): :wrench: Tune the editor settings",
    "build(i18n): 🧑‍💻 Improve the local setup",
    "feat(web): ✨ Add the settings page\n\nThe page reads the saved preferences.",
    "feat(web): 💥 Drop the old settings route\n\nBREAKING CHANGE: the old route is gone.",
  ])("passes: %s", async (message) => {
    expect(await failedRules(message)).toEqual([]);
  });

  test("passes at exactly 50 code points, counting a variation selector as one", async () => {
    expect(await failedRules("fix(mobile): ⌨️ Close the keyboard outside a field")).toEqual([]);
    expect(await failedRules("fix(mobile): ⌨️ Close the keyboards outside a field")).toEqual([
      "header-max-code-points",
    ]);
  });

  test("counts an emoji outside the basic plane as one code point, not two", async () => {
    expect(await failedRules("fix(mobile): 🐛 Close the keyboard outside the form")).toEqual([]);
  });
});

describe("a message git writes itself", () => {
  test.each([
    "Merge branch 'feat/12-settings-page' into main",
    'Revert "feat(web): ✨ Add the settings page"\n\nThis reverts commit 1a2b3c4d.',
    'Reapply "feat(web): ✨ Add the settings page"\n\nThis reverts commit 5e6f7a8b.',
    "fixup! feat(web): ✨ Add the settings page",
    "squash! feat(web): ✨ Add the settings page",
    "amend! feat(web): ✨ Add the settings page\n\nfeat(web): ✨ Add the profile page",
  ])("skips the shape rules: %s", async (message) => {
    expect(await failedRules(message)).toEqual([]);
  });

  test("still rejects a Co-authored-by trailer in a merge", async () => {
    expect(
      await failedRules(
        "Merge branch 'main' into feat/12-settings-page\n\nCo-authored-by: Ada <ada@example.com>",
      ),
    ).toEqual(["no-co-authored-by"]);
  });
});

describe("a message outside the convention", () => {
  test.each([
    ["feat(web): add the settings page", ["subject-gitmoji"]],
    ["feat(web): ✨Add the settings page", ["subject-gitmoji"]],
    ["feat(web): ✨ add the settings page", ["subject-upper-first"]],
    ["feat(web): ✨ Add the settings page and the profile page", ["header-max-code-points"]],
    ["feat(web): ✨ Add the settings page.", ["subject-full-stop"]],
    [
      "feat(web): ✨ Add the settings page\nThe page reads the preferences.",
      ["body-leading-blank"],
    ],
    ["feat: ✨ Add the settings page", ["header-shape"]],
    ["feat(Web): ✨ Add the settings page", ["header-shape"]],
    ["feat(web-): ✨ Add the settings page", ["header-shape"]],
    ["feat(web):✨ Add the settings page", ["header-shape"]],
    ["feat(web)!: 💥 Drop the old settings route", ["header-shape"]],
    ["feature(web): ✨ Add the settings page", ["type-enum"]],
    ["Feat(web): ✨ Add the settings page", ["header-shape", "type-enum"]],
    ["Added settings page", ["header-shape"]],
  ])("rejects %s", async (message, rules) => {
    expect(await failedRules(message)).toEqual(rules);
  });

  test.each([
    "feat(web): ✨ Added the settings page",
    "feat(web): ✨ Adds the settings page",
    "fix(web): 🐛 Fixing the header overflow",
    "feat(web): ✨ The settings page",
    "feat(web): ✨ New settings page",
  ])("rejects a first word that is not an instruction: %s", async (message) => {
    expect(await failedRules(message)).toEqual(["subject-imperative"]);
  });

  test.each([
    "feat(web): ✨ Add the read-only page",
    "feat(web): ✨ Add the page (settings)",
    "feat(web): ✨ Add settings, add profile",
    "feat(web): ✨ Add the visitor's page",
    'feat(web): ✨ Add the "settings" page',
    "feat(web): ✨ Add the `Settings` page",
    "feat(web): ✨ Add settings; add profile",
  ])("rejects a banned character: %s", async (message) => {
    expect(await failedRules(message)).toEqual(["subject-allowed-characters"]);
  });

  test.each([
    "feat(web): ✨ Add the settings page\n\nCo-authored-by: Ada <ada@example.com>",
    "feat(web): ✨ Add the settings page\n\nThe body.\n\nCo-Authored-By: Ada <ada@example.com>",
  ])("rejects a Co-authored-by trailer: %s", async (message) => {
    expect(await failedRules(message)).toEqual(["no-co-authored-by"]);
  });
});

describe("a message read from the file git hands the hook", () => {
  test("ignores what git writes below the scissors line", async () => {
    const message = [
      "feat(web): ✨ Add the settings page",
      "",
      "# Please enter the commit message for your changes.",
      "# ------------------------ >8 ------------------------",
      "# Do not modify or remove the line above.",
      "diff --git a/notes.txt b/notes.txt",
      " Co-authored-by: Ada <ada@example.com>",
    ].join("\n");

    expect(await failedRules(message, { commentChar: "#" })).toEqual([]);
  });
});
