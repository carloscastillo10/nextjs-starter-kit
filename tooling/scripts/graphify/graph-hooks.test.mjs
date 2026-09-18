import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { describe, expect, test } from "vitest";
import { parse, stringify } from "yaml";

import {
  createGraphProject,
  EXPORT,
  pause,
  SCRIPT,
  TEST_TIMEOUT_MS,
  timed,
  UPDATE,
} from "./graph-sandbox.mjs";

const LEFTHOOK_CONFIG = fileURLToPath(new URL("../../../lefthook.yml", import.meta.url));

const LEFTHOOK = createRequire(import.meta.url).resolve("lefthook/bin/index.js");

const GRAPH_HOOKS = ["post-commit", "post-checkout", "post-merge", "post-rewrite"];

const config = parse(readFileSync(LEFTHOOK_CONFIG, "utf8"));

const graphJob = (hook) => config[hook]?.jobs?.find(({ name }) => name === "graph");

// The graph jobs of the real config, calling this checkout's script by its full path.
const graphConfig = () =>
  stringify(
    Object.fromEntries(
      GRAPH_HOOKS.map((hook) => [hook, config[hook]]).filter(([, value]) => value),
    ),
  ).replaceAll("node tooling/scripts/graphify/graph-rebuild.mjs", `node "${SCRIPT}"`);

const projectWithHooks = () => {
  const project = createGraphProject();
  const { sandbox } = project;

  sandbox.write("lefthook.yml", graphConfig());
  sandbox.write("notes.txt", "start\n");
  sandbox.write(".gitignore", ".graphify/\n");
  sandbox.git(["add", "."]);
  sandbox.git(["commit", "--quiet", "--message", "Start"]);
  execFileSync(process.execPath, [LEFTHOOK, "install"], {
    cwd: sandbox.directory,
    env: sandbox.env,
    stdio: "ignore",
  });

  const git = (args, env = {}) =>
    spawnSync("git", args, {
      cwd: sandbox.directory,
      encoding: "utf8",
      env: { ...sandbox.env, ...env },
    });
  const rebuilds = () => project.started("start").filter((step) => step === UPDATE).length;

  // Runs a git command, waits for any rebuild it started, and counts the new ones.
  const rebuildsAfter = async (args) => {
    const before = rebuilds();

    expect(git(args).status).toBe(0);

    await pause(300);
    await project.waitUntilIdle();

    return rebuilds() - before;
  };

  return { ...project, git, rebuildsAfter };
};

describe("the graph jobs in lefthook", () => {
  test.each(GRAPH_HOOKS)("%s passes every git argument to graph-rebuild", (hook) => {
    expect(graphJob(hook)?.run).toBe(`node tooling/scripts/graphify/graph-rebuild.mjs ${hook} {0}`);
  });

  test("skip rebases where git reruns them for each replayed commit", () => {
    expect(graphJob("post-commit")?.skip).toEqual(["rebase"]);
    expect(graphJob("post-checkout")?.skip).toEqual(["rebase"]);
  });

  test("keep post-merge and post-rewrite, which a rebase would otherwise skip", () => {
    expect(graphJob("post-merge")?.skip).toBeUndefined();
    expect(graphJob("post-rewrite")?.skip).toBeUndefined();
  });
});

describe("the graph jobs under a real lefthook", { timeout: TEST_TIMEOUT_MS }, () => {
  test("a commit returns while the rebuild it started goes on", async () => {
    const { git, started, waitUntilIdle } = projectWithHooks();
    const { elapsedMs, status } = timed(() =>
      git(["commit", "--quiet", "--allow-empty", "--message", "Work"], { GRAPHIFY_SECONDS: "3" }),
    );

    expect(status).toBe(0);
    expect(elapsedMs).toBeLessThan(2500);

    await waitUntilIdle();

    expect(started("end")).toEqual([UPDATE, EXPORT]);
  });

  test("commit, branch checkout, merge and rebase each rebuild once, a file checkout never", async () => {
    const { rebuildsAfter, sandbox } = projectWithHooks();

    expect(await rebuildsAfter(["commit", "--quiet", "--allow-empty", "--message", "One"])).toBe(1);
    expect(await rebuildsAfter(["switch", "--quiet", "--create", "side"])).toBe(1);

    sandbox.write("notes.txt", "edited\n");

    expect(await rebuildsAfter(["checkout", "--", "notes.txt"])).toBe(0);
    expect(await rebuildsAfter(["commit", "--quiet", "--allow-empty", "--message", "Two"])).toBe(1);
    expect(await rebuildsAfter(["switch", "--quiet", "main"])).toBe(1);
    expect(await rebuildsAfter(["commit", "--quiet", "--allow-empty", "--message", "Three"])).toBe(
      1,
    );
    expect(await rebuildsAfter(["switch", "--quiet", "side"])).toBe(1);
    expect(await rebuildsAfter(["rebase", "--quiet", "main"])).toBe(1);
    expect(await rebuildsAfter(["switch", "--quiet", "main"])).toBe(1);
    expect(await rebuildsAfter(["merge", "--quiet", "--ff-only", "side"])).toBe(1);
  });
});
