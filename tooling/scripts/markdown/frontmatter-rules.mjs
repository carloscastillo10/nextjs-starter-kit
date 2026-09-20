import { parse } from "yaml";

export const ADR_STATUSES = ["proposed", "accepted", "superseded", "deprecated"];

const IGNORED = [
  /(?:^|\/)node_modules\//u,
  /^\.claude\/(?:skills|agents|commands|worktrees)\//u,
  /^\.github\//u,
  /^\.graphify\//u,
  /^\.agents\//u,
  /(?:^|\/)\.obsidian\//u,
  /^apps\/[^/]+\/(?:AGENTS|CLAUDE)\.md$/u,
  /(?:^|\/)(?:CHANGELOG|LICENSE)\.md$/u,
];

// GitHub renders frontmatter as a table above the text, which a visitor reads first.
const WITHOUT_FRONTMATTER = /(?:^|\/)(?:README|CONTRIBUTING)\.md$/u;

const INDEXED = [/^[^/]+\.md$/u, /^docs\//u];

const DECISION_RECORD = /^docs\/adr\//u;

const OPENING = /^---\r?\n/u;

const CLOSING = /\r?\n(?:---|\.\.\.)[ \t]*(?:\r?\n|$)/u;

const posix = (file) => file.replaceAll("\\", "/");

const kindOf = (file) => {
  if (IGNORED.some((pattern) => pattern.test(file))) return "ignored";
  if (WITHOUT_FRONTMATTER.test(file)) return "forbidden";
  if (INDEXED.some((pattern) => pattern.test(file))) return "required";

  return "optional";
};

export const classifyMarkdown = (path) => {
  const file = posix(path);
  const kind = kindOf(file);

  return { kind, needsStatus: kind === "required" && DECISION_RECORD.test(file) };
};

const blockIn = (text) => {
  if (!OPENING.test(text)) return null;
  const body = text.replace(OPENING, "");
  const end = CLOSING.exec(body);

  return end === null ? null : body.slice(0, end.index);
};

const isFilledString = (value) => typeof value === "string" && value.trim() !== "";

const isListOf = (value, isMember) => Array.isArray(value) && value.every(isMember);

const parsed = (block) => {
  try {
    const data = parse(block);

    return typeof data === "object" && data !== null && !Array.isArray(data)
      ? { data }
      : { error: "a mapping of keys to values" };
  } catch (error) {
    return { error: error.message.split("\n")[0] };
  }
};

const SHAPE = [
  "  ---",
  "  tags: [conventions, comments]",
  "  aliases: [Comment conventions]",
  "  ---",
].join("\n");

const listFailures = (data) => {
  const failures = [];

  if (!isListOf(data.tags, isFilledString) || data.tags.length === 0) {
    failures.push({
      rule: "tags",
      message: `needs a non-empty tags list, so a search finds it:\n\n${SHAPE}`,
    });
  }

  if (!isListOf(data.aliases, isFilledString)) {
    failures.push({
      rule: "aliases",
      message: `needs an aliases list, empty when the title is the only name it goes by:\n\n${SHAPE}`,
    });
  }

  return failures;
};

const statusFailures = (data, needsStatus) => {
  if (!needsStatus || ADR_STATUSES.includes(data.status)) return [];

  return [
    {
      rule: "status",
      message: `is a decision record, so it carries status: ${ADR_STATUSES.join(" | ")}`,
    },
  ];
};

const requiredFailures = ({ block, needsStatus }) => {
  if (block === null) {
    return [
      {
        rule: "missing",
        message: `has no frontmatter block, and every document carries one:\n\n${SHAPE}`,
      },
    ];
  }

  const { data, error } = parsed(block);

  if (error !== undefined) {
    return [{ rule: "invalid-yaml", message: `has a frontmatter block that is not ${error}` }];
  }

  return [...listFailures(data), ...statusFailures(data, needsStatus)];
};

export const inspectFrontmatter = ({ file, text }) => {
  const { kind, needsStatus } = classifyMarkdown(file);
  const block = blockIn(text);

  if (kind === "required") return { failures: requiredFailures({ block, needsStatus }) };

  if (kind === "forbidden" && block !== null) {
    return {
      failures: [
        {
          rule: "unwanted",
          message: "carries frontmatter, and GitHub renders it as a table above the first heading",
        },
      ],
    };
  }

  return { failures: [] };
};
