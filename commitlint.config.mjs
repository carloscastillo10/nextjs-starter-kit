import { RuleConfigSeverity } from "@commitlint/types";
import {
  COMMIT_TYPES,
  commitRulesPlugin,
  MAX_HEADER_CODE_POINTS,
} from "@repo/scripts/commit-rules";

/*
 * The default ignores are off because they skip every rule on a merge, and a Co-authored-by
 * trailer must not ride in on one. The shape rules skip what git writes itself instead.
 */
export default {
  defaultIgnores: false,
  helpUrl: "CONTRIBUTING.md#commits",
  parserPreset: {
    parserOpts: {
      headerPattern: /^(\w*)(?:\(([^()]*)\))?: (.*)$/u,
      headerCorrespondence: ["type", "scope", "subject"],
    },
  },
  plugins: [commitRulesPlugin],
  rules: {
    "type-enum": [RuleConfigSeverity.Error, "always", COMMIT_TYPES],
    "header-shape": [RuleConfigSeverity.Error, "always"],
    "header-max-code-points": [RuleConfigSeverity.Error, "always", MAX_HEADER_CODE_POINTS],
    "subject-gitmoji": [RuleConfigSeverity.Error, "always"],
    "subject-upper-first": [RuleConfigSeverity.Error, "always"],
    "subject-imperative": [RuleConfigSeverity.Error, "always"],
    "subject-allowed-characters": [RuleConfigSeverity.Error, "always"],
    "subject-full-stop": [RuleConfigSeverity.Error, "never", "."],
    "body-leading-blank": [RuleConfigSeverity.Error, "always"],
    "no-co-authored-by": [RuleConfigSeverity.Error, "always"],
  },
};
