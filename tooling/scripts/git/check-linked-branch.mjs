import { execFileSync } from "node:child_process";

const NAMED_FOR_AN_ISSUE = /^[a-z]+\/(?<issue>\d+)-/u;

const QUERY = `query($owner:String!,$name:String!,$issue:Int!){
  repository(owner:$owner,name:$name){ issue(number:$issue){ linkedBranches(first:1){ totalCount } } }
}`;

const run = (command, ...args) =>
  execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const currentBranch = () => {
  try {
    return run("git", "rev-parse", "--abbrev-ref", "HEAD");
  } catch {
    return "";
  }
};

// A hook that blocks a push over a missing answer is worse than the thing it guards.
const isOnTheRemote = (branch) => {
  try {
    return run("git", "ls-remote", "--heads", "origin", branch).length > 0;
  } catch {
    return true;
  }
};

const linkedBranchCount = (issue) => {
  try {
    const [owner, name] = run(
      "gh",
      "repo",
      "view",
      "--json",
      "nameWithOwner",
      "-q",
      ".nameWithOwner",
    ).split("/");
    const answer = run(
      "gh",
      "api",
      "graphql",
      "-f",
      `query=${QUERY}`,
      "-F",
      `owner=${owner}`,
      "-F",
      `name=${name}`,
      "-F",
      `issue=${issue}`,
    );

    return JSON.parse(answer).data.repository.issue.linkedBranches.totalCount;
  } catch {
    return null;
  }
};

const explain = (issue, branch) => `
  #${issue} has no linked branch, and this first push is the last moment it can get one.

  A branch named after an issue is a convention for people, and GitHub does not read
  it. gh issue develop links a branch to its issue when it creates that branch, and a
  branch that is already on the remote cannot be linked that way. Until a pull request
  says Closes #${issue}, the issue would show no work in progress.

  Move your work onto a branch the issue knows about:

    git branch -m ${branch}-local
    gh issue develop ${issue} --name ${branch} --base main --checkout
    git merge ${branch}-local && git branch -d ${branch}-local

  Or, if this branch is not the work of #${issue}, rename it so it does not claim to be.
  Skip this check once: LEFTHOOK_EXCLUDE=linked git push
`;

const main = () => {
  const branch = currentBranch();
  const issue = NAMED_FOR_AN_ISSUE.exec(branch)?.groups?.issue;

  if (issue === undefined || isOnTheRemote(branch)) return 0;

  const linked = linkedBranchCount(issue);

  if (linked === null) {
    process.stderr.write(
      `check-linked-branch: could not ask GitHub about #${issue}, nothing checked\n`,
    );

    return 0;
  }

  if (linked > 0) {
    process.stdout.write(`check-linked-branch: #${issue} already has a linked branch\n`);

    return 0;
  }

  process.stderr.write(explain(issue, branch));

  return 1;
};

process.exitCode = main();
