import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";

import { describe, expect, onTestFinished, test } from "vitest";

const SCRIPT = fileURLToPath(new URL("check-author-identity.mjs", import.meta.url));

const TOKEN = "test-token";

const commitBy = (login, email = `${login ?? "nobody"}@example.com`) => ({
  sha: `${email.length}`.padEnd(40, "0"),
  commit: { message: `feat(web): ✨ Add work by ${email}\n\nBody.`, author: { email } },
  author: login === null ? null : { login },
});

const respond = (response, status, body) => {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(body === undefined ? "" : JSON.stringify(body));
};

const collaboratorStatus = (collaborators, login) => {
  if (collaborators === "forbidden") return 403;

  return collaborators.includes(login) ? 204 : 404;
};

const startApi = async ({ commits, collaborators }) => {
  const server = createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    const collaborator = /\/collaborators\/(?<login>[^/]+)$/u.exec(url.pathname)?.groups?.login;
    const page = Number(url.searchParams.get("page"));

    if (request.headers.authorization !== `Bearer ${TOKEN}`) return respond(response, 401);

    if (collaborator !== undefined) {
      return respond(response, collaboratorStatus(collaborators, collaborator));
    }

    return respond(response, 200, commits.slice((page - 1) * 100, page * 100));
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  onTestFinished(() => new Promise((resolve) => server.close(resolve)));

  return `http://127.0.0.1:${server.address().port}`;
};

const check = (args, env) =>
  new Promise((resolve) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], {
      env: { PATH: process.env.PATH, ...env },
    });
    const output = { stdout: "", stderr: "" };

    child.stdout.on("data", (chunk) => (output.stdout += chunk));
    child.stderr.on("data", (chunk) => (output.stderr += chunk));
    child.on("close", (status) => resolve({ status, ...output }));
  });

const checkPullRequest = async (api) =>
  check(["owner/demo", "7"], { GITHUB_API_URL: await startApi(api), GITHUB_TOKEN: TOKEN });

describe("check-author-identity", () => {
  test("asks for the repository and the pull request", async () => {
    expect((await check([], { GITHUB_TOKEN: TOKEN })).status).toBe(2);
  });

  test("needs a token", async () => {
    const { status, stderr } = await check(["owner/demo", "7"], {});

    expect(status).toBe(2);
    expect(stderr).toContain("GITHUB_TOKEN is not set");
  });

  test("passes when every commit is authored by a collaborator", async () => {
    const { status, stdout } = await checkPullRequest({
      commits: [commitBy("ada"), commitBy("grace")],
      collaborators: ["ada", "grace"],
    });

    expect(status).toBe(0);
    expect(stdout).toContain("every commit is authored by someone with access");
  });

  test("rejects a commit whose address belongs to no GitHub account", async () => {
    const { status, stderr } = await checkPullRequest({
      commits: [commitBy("ada"), commitBy(null, "stranger@example.com")],
      collaborators: ["ada"],
    });

    expect(status).toBe(1);
    expect(stderr).toContain("stranger@example.com: no GitHub account owns this address");
  });

  test("rejects a commit by an account without access, on any page", async () => {
    const { status, stderr } = await checkPullRequest({
      commits: [...Array.from({ length: 100 }, () => commitBy("ada")), commitBy("mallory")],
      collaborators: ["ada"],
    });

    expect(status).toBe(1);
    expect(stderr).toContain("mallory has no access to this repository");
  });

  test("says what the token lacks when GitHub refuses the collaborator check", async () => {
    const { status, stderr } = await checkPullRequest({
      commits: [commitBy("ada")],
      collaborators: "forbidden",
    });

    expect(status).toBe(2);
    expect(stderr).toContain("the token needs push access");
  });
});
