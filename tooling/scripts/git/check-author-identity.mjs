const API = process.env.GITHUB_API_URL ?? "https://api.github.com";

const PAGE_SIZE = 100;

const request = (path, token) =>
  fetch(`${API}${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "x-github-api-version": "2022-11-28",
    },
  });

const commitsIn = async (pullRequest, page = 1) => {
  const { repository, number, token } = pullRequest;
  const response = await request(
    `/repos/${repository}/pulls/${number}/commits?per_page=${PAGE_SIZE}&page=${page}`,
    token,
  );

  if (!response.ok) {
    throw new Error(`listing the commits returned ${response.status} ${response.statusText}`);
  }

  const batch = await response.json();

  return batch.length < PAGE_SIZE ? batch : [...batch, ...(await commitsIn(pullRequest, page + 1))];
};

// GitHub answers this only to a token with push access, which a job has to ask for.
const hasAccess = async ({ repository, token }, login) => {
  const { status, statusText } = await request(
    `/repos/${repository}/collaborators/${login}`,
    token,
  );

  if (status !== 204 && status !== 404) {
    throw new Error(
      `the collaborator check for ${login} returned ${status} ${statusText}; the token needs push access`,
    );
  }

  return status === 204;
};

const rejectionOf = (access, commit) => {
  const email = commit.commit.author?.email ?? "no email";
  const login = commit.author?.login;

  if (login === undefined) return `${email}: no GitHub account owns this address`;

  return access.get(login) === true ? null : `${email}: ${login} has no access to this repository`;
};

const report = (rejected) =>
  [
    "",
    "  Pull request rejected: a commit is not authored by anyone with access.",
    "",
    ...rejected.flatMap(({ sha, subject, why }) => [
      `    ${sha.slice(0, 8)}  ${subject}`,
      `              ${why}`,
    ]),
    "",
    "  A commit carries whatever identity git had when it was made, and GitHub",
    "  attributes it to whoever owns that address. Fix the identity, then rewrite",
    "  the commits so they carry it:",
    "",
    "    git config --local --unset-all user.email",
    "    git rebase --no-ff origin/main --exec 'git commit --amend --no-edit --reset-author'",
    "    git push --force-with-lease",
    "",
  ].join("\n");

const checkAuthors = async (pullRequest) => {
  const commits = await commitsIn(pullRequest);
  const logins = [...new Set(commits.map(({ author }) => author?.login).filter(Boolean))];
  const access = new Map(
    await Promise.all(logins.map(async (login) => [login, await hasAccess(pullRequest, login)])),
  );
  const rejected = commits
    .map((commit) => ({
      sha: commit.sha,
      subject: commit.commit.message.split("\n")[0],
      why: rejectionOf(access, commit),
    }))
    .filter(({ why }) => why !== null);

  if (rejected.length === 0) {
    process.stdout.write(
      "check-author-identity: every commit is authored by someone with access\n",
    );

    return 0;
  }

  process.stderr.write(`${report(rejected)}\n`);

  return 1;
};

const main = async () => {
  const [repository, number] = process.argv.slice(2);
  const token = process.env.GITHUB_TOKEN;

  if (repository === undefined || number === undefined) {
    process.stderr.write("check-author-identity: usage: <owner/repo> <pull-request-number>\n");

    return 2;
  }

  if (token === undefined || token === "") {
    process.stderr.write("check-author-identity: GITHUB_TOKEN is not set\n");

    return 2;
  }

  try {
    return await checkAuthors({ repository, number, token });
  } catch (error) {
    process.stderr.write(`check-author-identity: ${error.message}\n`);

    return 2;
  }
};

process.exitCode = await main();
