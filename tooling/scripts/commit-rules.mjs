export const COMMIT_TYPES = [
  "feat",
  "fix",
  "docs",
  "style",
  "refactor",
  "perf",
  "test",
  "build",
  "ci",
  "chore",
  "revert",
];

export const MAX_HEADER_CODE_POINTS = 50;

/*
 * Any action verb is welcome, so the check rejects the forms that are not an
 * instruction rather than allow-listing the ones that are.
 */
const NOT_IMPERATIVE = new Set(
  [
    ["Added", "Adding", "Adds"],
    ["Bumped", "Bumping", "Bumps"],
    ["Changed", "Changing", "Changes"],
    ["Created", "Creating", "Creates"],
    ["Deleted", "Deleting", "Deletes"],
    ["Fixed", "Fixing", "Fixes"],
    ["Implemented", "Implementing", "Implements"],
    ["Improved", "Improving", "Improves"],
    ["Made", "Making", "Makes"],
    ["Moved", "Moving", "Moves"],
    ["Refactored", "Refactoring", "Refactors"],
    ["Removed", "Removing", "Removes"],
    ["Renamed", "Renaming", "Renames"],
    ["Updated", "Updating", "Updates"],
    ["Used", "Using", "Uses"],
  ].flat(),
);

const NOT_A_VERB = new Set([
  "A",
  "An",
  "The",
  "This",
  "That",
  "These",
  "Those",
  "It",
  "We",
  "I",
  "My",
  "Our",
  "New",
  "Some",
  "More",
  "Just",
  "Only",
  "Also",
  "Better",
  "Minor",
  "Quick",
  "Small",
  "Initial",
  "Various",
  "Misc",
]);

const WRITTEN_BY_GIT = /^(?:Merge |Revert "|Reapply "|fixup! |squash! |amend! )/u;

const HEADER_SHAPE = /^[a-z]+\([a-z][\da-z]*(?:-[\da-z]+)*\): /u;

const EMOJI = String.raw`\p{Extended_Pictographic}\uFE0F?(?:\u200D\p{Extended_Pictographic}\uFE0F?)*`;

const GITMOJI = new RegExp(String.raw`^(?:${EMOJI}|:[\da-z_+-]+:) (?<message>.+)$`, "u");

const BANNED_CHARACTERS = /[(),\-'"`;]/u;

const CO_AUTHORED_BY = /^co-authored-by:/iu;

const isWrittenByGit = (header) => WRITTEN_BY_GIT.test(header ?? "");

const messageAfterGitmoji = (subject) => GITMOJI.exec(subject ?? "")?.groups?.message;

const passes = () => [true];

const headerShape = ({ header }) => {
  if (isWrittenByGit(header) || HEADER_SHAPE.test(header ?? "")) return passes();

  return [
    false,
    'the header must read "type(scope): <gitmoji> Message", with a lower case type and a kebab-case scope',
  ];
};

const headerMaxCodePoints = ({ header }, _when, limit = MAX_HEADER_CODE_POINTS) => {
  const codePoints = [...(header ?? "")].length;

  if (isWrittenByGit(header) || codePoints <= limit) return passes();

  return [
    false,
    `the header is ${codePoints} characters, the limit is ${limit}; an emoji with a variation selector counts as two`,
  ];
};

const subjectGitmoji = ({ subject }) => {
  if (subject === null || messageAfterGitmoji(subject) !== undefined) return passes();

  return [
    false,
    "a gitmoji must follow the colon, then a space, then the message, as in: feat(web): ✨ Add the settings page",
  ];
};

const subjectUpperFirst = ({ subject }) => {
  const message = messageAfterGitmoji(subject);

  if (message === undefined || /^\p{Lu}/u.test(message)) return passes();

  return [false, "the first letter after the gitmoji must be upper case"];
};

const subjectImperative = ({ subject }) => {
  const [firstWord] = messageAfterGitmoji(subject)?.split(" ") ?? [];

  if (NOT_IMPERATIVE.has(firstWord)) {
    return [false, `use the imperative: "${firstWord}" describes what was done`];
  }

  if (NOT_A_VERB.has(firstWord)) return [false, `start with an action verb, not "${firstWord}"`];

  return passes();
};

const subjectAllowedCharacters = ({ subject }) => {
  const message = messageAfterGitmoji(subject);

  if (message === undefined || !BANNED_CHARACTERS.test(message)) return passes();

  return [false, "the message must not contain any of ( ) , - ' \" ` ;"];
};

const noCoAuthoredBy = ({ body, footer }) => {
  const lines = [body, footer].filter(Boolean).join("\n").split("\n");

  if (!lines.some((line) => CO_AUTHORED_BY.test(line.trim()))) return passes();

  return [
    false,
    "remove the Co-authored-by trailer: authorship belongs in the commit author field",
  ];
};

/*
 * Every shape rule passes a message that git writes itself (merges, reverts,
 * fixups), because git chose that wording. The Co-authored-by rule does not,
 * so a trailer cannot ride in on a local merge commit.
 */
export const commitRulesPlugin = {
  rules: {
    "header-shape": headerShape,
    "header-max-code-points": headerMaxCodePoints,
    "subject-gitmoji": subjectGitmoji,
    "subject-upper-first": subjectUpperFirst,
    "subject-imperative": subjectImperative,
    "subject-allowed-characters": subjectAllowedCharacters,
    "no-co-authored-by": noCoAuthoredBy,
  },
};
