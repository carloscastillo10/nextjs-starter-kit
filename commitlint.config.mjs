import { RuleConfigSeverity } from "@commitlint/types";

/*
 * Conventional Commits, plus a required kebab-case scope: `type(scope): subject`.
 * Pull requests are squashed, so the pull request title is the message that reaches
 * `main`, and CI checks it with this same config.
 */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [RuleConfigSeverity.Error, "always", "kebab-case"],
    "scope-empty": [RuleConfigSeverity.Error, "never"],
  },
};
