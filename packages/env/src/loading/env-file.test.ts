import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { restoreEnv, snapshotEnv } from "../testing/process-env.fixture";
import { fixtureRoot, orphanDirectory } from "../testing/workspace.fixture";
import { activeAppEnv, loadEnvFile } from "./env-file";

let snapshot: NodeJS.ProcessEnv;

beforeEach(() => {
  snapshot = snapshotEnv();
  process.env.APP_ENV = "dev";
});

afterEach(() => {
  restoreEnv(snapshot);
});

describe("activeAppEnv", () => {
  it("defaults to dev when APP_ENV is unset", () => {
    Reflect.deleteProperty(process.env, "APP_ENV");

    expect(activeAppEnv()).toBe("dev");
  });

  it("treats an empty APP_ENV as unset", () => {
    process.env.APP_ENV = "";

    expect(activeAppEnv()).toBe("dev");
  });
});

describe("loadEnvFile", () => {
  it("leaves a variable that is already set alone", () => {
    const root = fixtureRoot();

    writeFileSync(join(root, ".env.dev"), "ENV_TEST_TAKEN=from_file\nENV_TEST_FREE=from_file\n");
    process.env.ENV_TEST_TAKEN = "from_shell";
    Reflect.deleteProperty(process.env, "ENV_TEST_FREE");

    loadEnvFile(root);

    expect(process.env.ENV_TEST_TAKEN).toBe("from_shell");
    expect(process.env.ENV_TEST_FREE).toBe("from_file");
  });

  it("reads the file that APP_ENV names", () => {
    const root = fixtureRoot();

    writeFileSync(join(root, ".env.staging"), "ENV_TEST_WHICH=staging\n");
    process.env.APP_ENV = "staging";
    Reflect.deleteProperty(process.env, "ENV_TEST_WHICH");

    expect(loadEnvFile(root)).toBe(join(root, ".env.staging"));
    expect(process.env.ENV_TEST_WHICH).toBe("staging");
  });

  it("returns null when the environment has no file", () => {
    process.env.APP_ENV = "production";

    expect(loadEnvFile(fixtureRoot())).toBeNull();
  });

  it("returns null when nothing above the folder marks a workspace", () => {
    expect(loadEnvFile(orphanDirectory())).toBeNull();
  });

  it("loads nothing when APP_ENV is not a plain name, so it cannot point outside the root", () => {
    const root = fixtureRoot();

    writeFileSync(join(root, "outside"), "ENV_TEST_TRAVERSAL=loaded\n");
    process.env.APP_ENV = "/../outside";
    Reflect.deleteProperty(process.env, "ENV_TEST_TRAVERSAL");

    expect(loadEnvFile(root)).toBeNull();
    expect(process.env.ENV_TEST_TRAVERSAL).toBeUndefined();
  });
});
