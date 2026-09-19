import { execFileSync } from "node:child_process";

const IDENTITY_KEYS = ["user.name", "user.email"];

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

const withoutTimestamp = (ident) => ident.replace(/ \d+ [+-]\d{4}$/u, "");

const repositoryScopes = () =>
  git("config", "--bool", "--get", "extensions.worktreeConfig") === "true"
    ? ["--local", "--worktree"]
    : ["--local"];

const overridesIn = (scope) =>
  IDENTITY_KEYS.filter((key) => git("config", scope, "--get", key) !== "").map(
    (key) => `    git config ${scope} --unset-all ${key}`,
  );

const isSetOnTheCommandLine = () =>
  IDENTITY_KEYS.some((key) => git("config", "--show-scope", "--get", key).startsWith("command"));

const COMMAND_LINE_HELP = [
  "  A git -c user.email=… or -c user.name=… on the command line sets it.",
  "  Commit without it, or correct your global identity.",
];

const ENVIRONMENT_HELP = [
  "  Nothing in this repository overrides it, so the environment does:",
  "  unset GIT_AUTHOR_NAME, GIT_AUTHOR_EMAIL, GIT_COMMITTER_NAME and",
  "  GIT_COMMITTER_EMAIL, or correct your global identity.",
];

/*
 * Every worktree shares one config file, so an identity set inside the
 * repository reassigns authorship for every session on the machine; that is
 * the case worth naming precisely.
 */
const howToFix = () => {
  const commands = repositoryScopes().flatMap(overridesIn);

  if (commands.length > 0) {
    return [
      "  This repository overrides your global identity, and every worktree shares",
      "  that setting, so it reassigns authorship for every session here. Clear it:",
      "",
      ...commands,
      "",
      "  Or, if the identity above is the one you want, set it globally instead.",
    ];
  }

  return isSetOnTheCommandLine() ? COMMAND_LINE_HELP : ENVIRONMENT_HELP;
};

const main = () => {
  const name = git("config", "--global", "--get", "user.name");
  const email = git("config", "--global", "--get", "user.email");

  if (name === "" || email === "") {
    process.stderr.write(
      "check-git-identity: no global git identity to compare against, skipped\n",
    );

    return 0;
  }

  const expected = `${name} <${email}>`;
  const wrong = [
    { role: "author", ident: withoutTimestamp(git("var", "GIT_AUTHOR_IDENT")) },
    { role: "committer", ident: withoutTimestamp(git("var", "GIT_COMMITTER_IDENT")) },
  ].filter(({ ident }) => ident !== "" && ident !== expected);

  if (wrong.length === 0) return 0;

  const report = [
    "",
    "  Commit refused: it would not carry your global git identity.",
    "",
    ...wrong.map(({ role, ident }) => `    ${role.padEnd(9)} ${ident}`),
    `    ${"expected".padEnd(9)} ${expected}`,
    "",
    ...howToFix(),
    "",
    "  Bypass in a real emergency: LEFTHOOK=0 git commit",
    "",
  ];

  process.stderr.write(`${report.join("\n")}\n`);

  return 1;
};

process.exitCode = main();
