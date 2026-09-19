import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROTECTED = ["main"];

const BRANCH_SCOPE = fileURLToPath(new URL("../check-branch-scope.mjs", import.meta.url));

const SKIPS_THE_HOOKS = /(?:^|[\s"'])--no-verify(?:[\s"']|$)|\bLEFTHOOK=(?:0|false)\b/u;

const SKIPS_THE_HOOKS_ON_A_COMMIT = /\bgit\s+commit\b[^&|;]*(?:^|\s)-n(?:\s|$)/u;

const PUSH = /\bgit\s+push\b([^&|;]*)/gu;

const HEREDOC_BODY = /<<-?\s*['"]?([A-Za-z_]\w*)['"]?[^\n]*\n[\s\S]*?\n\1\b/gu;

const PULL_REQUEST_RULES = [
  "The pull request template is not optional. Four sections, in this order:",
  "",
  "  ## 🎯 What this changes        — with `Closes #<issue>`",
  "  ## 🧪 How it was verified      — commands and their real output",
  '  ## 🧠 What this branch learned — or the words "nothing new"',
  "  ## ✅ Before review            — the checklist, honestly ticked",
  "",
  "A box left unchecked is worth more than a wrongly ticked one: say what you did not run",
  "and why.",
  "",
  "The title becomes the commit subject on main, so it obeys the same convention:",
  "`type(scope): <gitmoji> Message`, 50 characters or fewer, scope required, imperative verb",
  "in upper case. `printf '%s\\n' \"<title>\" | pnpm exec commitlint` answers before you open it,",
  "and CI checks it again.",
];

const SPLIT_IT_NOW = [
  "  Split it now if it should be split: a branch is cheap to divide and a pull request is",
  "  not. If it genuinely is one thing, say why in the body rather than leaving a reviewer",
  "  to work it out.",
  "",
];

const readPayload = async () => {
  const chunks = [];

  for await (const chunk of process.stdin) chunks.push(chunk);

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return undefined;
  }
};

const respond = (hookSpecificOutput) => {
  process.stdout.write(
    JSON.stringify({ hookSpecificOutput: { hookEventName: "PreToolUse", ...hookSpecificOutput } }),
  );
};

const deny = (permissionDecisionReason) =>
  respond({ permissionDecision: "deny", permissionDecisionReason });

const inject = (additionalContext) => respond({ additionalContext });

/*
 * A file written through a heredoc is content, not a command: a guide that mentions the flag
 * it forbids could not be written from a shell at all.
 */
const withoutHeredocBodies = (command) => command.replaceAll(HEREDOC_BODY, "<<$1");

const branchOf = (refspec) =>
  refspec
    .replaceAll(/^["'+]+|["']+$/gu, "")
    .split(":")
    .at(-1)
    .replace(/^refs\/heads\//u, "");

const checkedOutBranch = (cwd) => {
  try {
    return execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return undefined;
  }
};

/*
 * The first bare word after the remote is a refspec, and a push without one goes to the
 * branch that happens to be checked out, which is how main gets pushed by accident.
 */
const pushedBranches = (argumentsOfPush, cwd) => {
  const words = argumentsOfPush
    .split(/\s+/u)
    .filter((word) => word !== "" && !word.startsWith("-"));
  const refspecs = words.slice(1);

  if (refspecs.length === 0) return [checkedOutBranch(cwd)].filter(Boolean);

  return refspecs.map(branchOf);
};

const protectedPushIn = (command, cwd) =>
  [...command.matchAll(PUSH)]
    .flatMap(([, argumentsOfPush]) => pushedBranches(argumentsOfPush, cwd))
    .find((branch) => PROTECTED.includes(branch));

const scopeReport = (cwd) => {
  try {
    return execFileSync(process.execPath, [BRANCH_SCOPE], {
      cwd,
      encoding: "utf8",
      timeout: 10_000,
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
};

const payload = await readPayload();
const command = payload?.tool_input?.command;

if (typeof command !== "string") process.exit(0);

const cwd = typeof payload.cwd === "string" ? payload.cwd : process.cwd();
const executed = withoutHeredocBodies(command);

if (SKIPS_THE_HOOKS.test(executed) || SKIPS_THE_HOOKS_ON_A_COMMIT.test(executed)) {
  deny(
    "Blocked: the git hooks are the only check that runs before code leaves this machine, and " +
      "skipping one moves the same failure to the pull request. Fix what the hook reports; if " +
      "the hook itself is broken, say so and fix the hook. To skip one job rather than every " +
      "hook, name it: LEFTHOOK_EXCLUDE=<job>, such as LEFTHOOK_EXCLUDE=graph for the code graph.",
  );
  process.exit(0);
}

const pushedTo = protectedPushIn(executed, cwd);

if (pushedTo !== undefined) {
  deny(
    `Blocked: pushing straight to ${pushedTo}. Every change gets there through a pull request, ` +
      `so push the branch you are on and open one against ${pushedTo}.`,
  );
  process.exit(0);
}

if (/\bgh\s+pr\s+create\b/u.test(executed)) {
  const report = scopeReport(cwd);
  const carriesTheTemplate = /--body-file[\s=]/u.test(executed);

  inject(
    [
      ...(report === "" ? [] : [report, "", ...SPLIT_IT_NOW]),
      ...PULL_REQUEST_RULES,
      "",
      carriesTheTemplate
        ? "You are passing --body-file, so read the template first and follow its headings."
        : "You are not passing --body-file. Write the body to a file that follows the template.",
    ].join("\n"),
  );
}
