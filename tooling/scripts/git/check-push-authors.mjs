import { execFileSync } from "node:child_process";

const HISTORY = "origin/main";

const git = (...args) => {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const resolves = (ref) => git("rev-parse", "--verify", "--quiet", `${ref}^{commit}`) !== "";

const lines = (text) => text.split("\n").filter(Boolean);

const commitsAdded = (base) =>
  lines(git("log", "--format=%H%x09%ae%x09%s", `${git("merge-base", base, "HEAD")}..HEAD`)).map(
    (line) => {
      const [sha, email, subject] = line.split("\t");

      return { sha, email, subject };
    },
  );

/*
 * The accepted set derives itself from git, so there is no list to keep: a first push
 * carries its author's own global identity, and from then on that address is on main.
 */
const knownAuthors = () => {
  const known = new Set(lines(git("log", "--format=%ae", HISTORY)));
  const own = git("config", "--global", "--get", "user.email");

  if (own !== "") known.add(own);

  return known;
};

const report = (foreign, base) =>
  [
    "",
    "  Push refused: a commit is authored by an address this repository has never",
    "  seen, and that is not your own global identity either.",
    "",
    ...foreign.flatMap(({ sha, email, subject }) => [
      `    ${sha.slice(0, 8)}  ${email}`,
      `              ${subject}`,
    ]),
    "",
    `  Accepted: your own global user.email, or any address already on ${HISTORY}.`,
    "  If these commits are yours, the identity was wrong when they were made:",
    "",
    "    git config --local --unset-all user.email",
    `    git rebase --no-ff ${base} --exec 'git commit --amend --no-edit --reset-author'`,
    "",
    "  Bypass in a real emergency: LEFTHOOK=0 git push",
    "",
  ].join("\n");

const main = () => {
  const base = process.argv[2] ?? HISTORY;

  if (!resolves(HISTORY) || !resolves(base)) {
    process.stderr.write(`check-push-authors: ${HISTORY} is not fetched, skipped\n`);

    return 0;
  }

  const added = commitsAdded(base);

  if (added.length === 0) {
    process.stderr.write(`check-push-authors: nothing added against ${base}\n`);

    return 0;
  }

  const known = knownAuthors();
  const foreign = added.filter(({ email }) => !known.has(email));

  if (foreign.length === 0) {
    process.stderr.write(`check-push-authors: ${added.length} commits, every author is known\n`);

    return 0;
  }

  process.stderr.write(`${report(foreign, base)}\n`);

  return 1;
};

process.exitCode = main();
