import { execFileSync } from "node:child_process";

const CONCERNS = [
  { id: "product", what: "the app and its packages", pattern: /^(?:apps|packages)\//u },
  { id: "delivery", what: "how it builds and ships", pattern: /^\.github\//u },
  {
    id: "tooling",
    what: "how the repository works on itself",
    pattern: /^(?:tooling|turbo|\.claude)\//u,
  },
];

const TRAVELS_WITH_ANY_CONCERN =
  /\.md$|^docs\/|^tooling\/spell-check\/|^[^/]+\.(?:json|jsonc|ya?ml|toml|mjs|cjs|js|ts)$|^\.[^/]+$/u;

const A_CONCERN_NEEDS_THIS_MANY_FILES = 3;

const A_CONCERN_NEEDS_THIS_SHARE_OF_THE_BRANCH = 0.1;

const A_REVIEWER_STARTS_SKIMMING_AT_FILES = 40;

const A_REVIEWER_STARTS_SKIMMING_AT_LINES = 1500;

const git = (...args) =>
  execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const resolves = (ref) => {
  try {
    git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`);

    return true;
  } catch {
    return false;
  }
};

// A report must never be the reason a push fails, so a history git cannot compare is skipped.
const changedAgainst = (base) => {
  try {
    const range = `${git("merge-base", base, "HEAD")}...HEAD`;
    const names = git("diff", "--name-only", range).split("\n").filter(Boolean);
    const lines = [
      ...git("diff", "--shortstat", range).matchAll(/(?<count>\d+) (?:insertion|deletion)/gu),
    ].reduce((sum, match) => sum + Number(match.groups.count), 0);

    return { names, lines };
  } catch {
    return null;
  }
};

const concernsIn = (names) => {
  const attributed = names
    .filter((name) => !TRAVELS_WITH_ANY_CONCERN.test(name))
    .map((name) => ({ name, concern: CONCERNS.find(({ pattern }) => pattern.test(name)) }))
    .filter(({ concern }) => concern !== undefined);

  return CONCERNS.map((concern) => ({
    ...concern,
    files: attributed.filter((file) => file.concern === concern).map(({ name }) => name),
  }))
    .filter(
      ({ files }) =>
        files.length >= A_CONCERN_NEEDS_THIS_MANY_FILES &&
        files.length / attributed.length >= A_CONCERN_NEEDS_THIS_SHARE_OF_THE_BRANCH,
    )
    .sort((first, second) => second.files.length - first.files.length);
};

const mixedFinding = ([primary, ...alsoHere]) => {
  const ownPullRequests =
    alsoHere.length === 1 ? "its own pull request" : "their own pull requests";
  const listed = [primary, ...alsoHere]
    .map(
      ({ id, files, what }) =>
        `        ${id.padEnd(9)} ${String(files.length).padStart(3)} files: ${what}`,
    )
    .join("\n");

  return [
    `This branch changes ${alsoHere.length + 1} unrelated things, so a reviewer has to switch context between them:\n${listed}\n\n      Keep ${primary.id} here and open ${alsoHere.map(({ id }) => id).join(" and ")} as ${ownPullRequests}, off main.`,
    ...alsoHere.map(
      ({ id, files }) => `${id} is ${files.slice(0, 5).join(", ")}${files.length > 5 ? ", …" : ""}`,
    ),
  ];
};

const sizeFinding = ({ names, lines }) =>
  `${names.length} files and ${lines} changed lines. A scaffold or a rename is legitimately this big, so size alone is not the defect; if the branch carries more than one commit's worth of reasoning, the review will be a skim. Say why it is one thing in the pull request.`;

const findingsFor = (changes) => {
  const concerns = concernsIn(changes.names);
  const isTooLarge =
    changes.names.length > A_REVIEWER_STARTS_SKIMMING_AT_FILES ||
    changes.lines > A_REVIEWER_STARTS_SKIMMING_AT_LINES;

  return {
    concerns,
    findings: [
      ...(concerns.length > 1 ? mixedFinding(concerns) : []),
      ...(isTooLarge ? [sizeFinding(changes)] : []),
    ],
  };
};

const baseFrom = (requested) => {
  if (requested !== undefined) return resolves(requested) ? requested : null;

  return ["origin/main", "main"].find(resolves) ?? null;
};

const main = () => {
  const args = process.argv.slice(2);
  const requested = args.find((arg) => !arg.startsWith("--"));
  const base = baseFrom(requested);

  if (base === null) {
    process.stderr.write(
      requested === undefined
        ? "check-branch-scope: no main branch to compare against, skipped\n"
        : `check-branch-scope: "${requested}" is not a commit this repository knows, skipped\n`,
    );

    return 0;
  }

  const changes = changedAgainst(base);

  if (changes === null) {
    process.stderr.write(`check-branch-scope: could not compare against ${base}, skipped\n`);

    return 0;
  }

  if (changes.names.length === 0) {
    process.stderr.write(`check-branch-scope: nothing changed against ${base}\n`);

    return 0;
  }

  const { concerns, findings } = findingsFor(changes);

  if (findings.length === 0) {
    process.stderr.write(
      `check-branch-scope: ${changes.names.length} files against ${base}, one concern (${concerns[0]?.id ?? "docs"}), ok\n`,
    );

    return 0;
  }

  process.stdout.write(
    [
      `\n  This branch against ${base}:\n`,
      ...findings.map((finding) => `      ! ${finding}\n`),
      "  One pull request is one thing. A vertical slice counts as one however many layers it crosses;",
      "  deployment and repository tooling review differently, so they travel on their own.\n\n",
    ].join("\n"),
  );

  return args.includes("--strict") ? 1 : 0;
};

process.exitCode = main();
