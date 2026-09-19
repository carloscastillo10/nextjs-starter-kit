const SOURCE_FILE = /\.[cm]?[jt]sx?$/u;

const GENERATED_OUTPUT = String.raw`(?:^|\/)(?:node_modules|\.next|\.turbo|dist|build|coverage)\/|\.d\.[cm]?ts$`;

/*
 * The same folders the comment check skips, kept here instead of imported: loading
 * the comment check brings the TypeScript parser, which would slow down every write.
 */
const SKIPPED_BY_COMMENT_CHECK = new RegExp(
  String.raw`(?:^|\/)(?:\.claude|\.agents)\/|${GENERATED_OUTPUT}`,
  "u",
);

const NOT_WRITTEN_BY_HAND = new RegExp(
  String.raw`^(?:\.claude\/skills|\.agents)\/|${GENERATED_OUTPUT}`,
  "u",
);

export const SKILL_RULES = [
  {
    id: "design-md",
    when: /^DESIGN\.md$/u,
    skills: ["design-md"],
    why: "it follows Google's DESIGN.md spec and documents the tokens the shared theme defines, so the two change together",
  },
  {
    id: "prose",
    when: /\.md$/u,
    skills: ["stop-slop"],
    why: "a guide is read far more often than it is written, and filler is cheaper to leave out than to cut later",
  },
  {
    id: "monorepo",
    when: /(?:^|\/)(?:package|turbo)\.json$|^pnpm-workspace\.yaml$|^turbo\//u,
    skills: ["turborepo"],
    why: "every script is a Turborepo task, and its inputs, outputs and environment decide what the cache replays",
  },
  {
    id: "theme",
    when: /^tooling\/tailwind\/.+\.css$/u,
    skills: ["tailwind-css", "design-md"],
    why: "the design tokens live here in Tailwind v4 syntax and DESIGN.md documents each of them, so a token changes in both places",
  },
  {
    id: "theme-config",
    when: /^tooling\/tailwind\//u,
    skills: ["project-conventions", "tailwind-css"],
    why: "this is what wires Tailwind into a build, so the version and the plugin names have to match the theme it compiles",
  },
  {
    id: "ui-kit",
    when: /^packages\/ui\/|(?:^|\/)components\.json$/u,
    skills: ["project-conventions", "shadcn", "tailwind-css"],
    why: "the kit comes from the shadcn CLI, run from apps/web, so a component is added or updated through the CLI rather than written from scratch, and the standard decides the shape of the code around it",
  },
  {
    id: "stylesheet",
    when: /\.css$/u,
    skills: ["tailwind-css"],
    why: "Tailwind v4 is configured in CSS: tokens come from the shared theme, and classes in workspace packages are found through `@source`",
  },
  {
    id: "route-file",
    when: /^apps\/[^/]+\/app\//u,
    skills: ["project-conventions", "feature-sliced-design", "vercel-react-best-practices"],
    why: "a route file only re-exports from the page and app layers, route segment config is the one thing written in place, and even there the standard asks for an arrow assigned to a constant",
  },
  {
    id: "app-ui",
    when: /^apps\/[^/]+\/src\/.+\.[jt]sx$/u,
    skills: [
      "project-conventions",
      "feature-sliced-design",
      "vercel-react-best-practices",
      "vercel-composition-patterns",
    ],
    why: "the layer decides what a component may import, the standard decides where its state and handlers live, and render cost and prop design are cheaper to get right now than in review",
  },
  {
    id: "app-code",
    when: /^apps\/[^/]+\/src\//u,
    skills: ["project-conventions", "feature-sliced-design", "vercel-react-best-practices"],
    why: "the layer, slice and segment decide where this code goes and what it may import, the standard decides its shape, and fetching on the server has patterns that avoid waterfalls",
  },
  {
    id: "source",
    when: SOURCE_FILE,
    skills: ["project-conventions"],
    why: "the standard holds in every workspace: arrow functions, guard clauses, a lookup map instead of `switch`, one responsibility per unit, and a comment only where the code cannot carry the reason",
  },
];

const COMMENT_RULE = [
  "**Comments explain why, never what** (docs/conventions/comments.md).",
  "Write one only where the code cannot carry the reason: a third party's surprising behavior,",
  "a rule whose origin the code does not show, a choice that looks wrong and is not.",
  "Delete the rest instead of shortening it, and rename the thing instead of describing it.",
  "A comment cites nothing: no path, no file name, no issue number, no numbered section.",
  "`pnpm lint:comments <file>` fails on a citation and reports on shape.",
].join(" ");

const LIST = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

const skillReminder = ({ skills, why }) =>
  `Load ${LIST.format(skills.map((skill) => `\`${skill}\``))} before you continue, ` +
  `unless ${skills.length === 1 ? "it is" : "they are"} already loaded: ${why}. ` +
  "A convention has to be in the context of whoever " +
  "writes the code; read after review, it produces a rewrite instead of a review.";

export const findSkillRule = (file) =>
  NOT_WRITTEN_BY_HAND.test(file) ? undefined : SKILL_RULES.find(({ when }) => when.test(file));

export const isCommentChecked = (file) =>
  SOURCE_FILE.test(file) && !SKIPPED_BY_COMMENT_CHECK.test(file);

export const remindersFor = (file) => {
  const rule = findSkillRule(file);
  const reminders = rule === undefined ? [] : [{ key: rule.id, text: skillReminder(rule) }];

  return isCommentChecked(file)
    ? [...reminders, { key: "comments", text: COMMENT_RULE }]
    : reminders;
};

export const formatReminders = (file, reminders) =>
  [
    `You are about to write ${file}.`,
    ...reminders.map(({ text }) => text),
    "Each reminder above appears once per session.",
  ].join("\n\n");
