import { writeFileSync } from "node:fs";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { appEnv } from "../schemas/app.schema";
import { restoreEnv, snapshotEnv } from "../testing/process-env.fixture";
import { fixtureRoot } from "../testing/workspace.fixture";
import { loadEnv } from "./env.loader";

const serviceEnv = {
  SERVICE_URL: z.url(),
  SERVICE_TOKEN: z.string().min(1),
  SERVICE_SECRET: z.string().min(1),
};

const keyedEnv = {
  SERVICE_KEY: z.string().refine((key) => key.startsWith("key_"), {
    error: "not a service key, which starts with key_",
  }),
};

const DECLARED = [
  "PORT",
  ...Object.keys(appEnv),
  ...Object.keys(serviceEnv),
  ...Object.keys(keyedEnv),
];

let snapshot: NodeJS.ProcessEnv;
let root: string;

beforeEach(() => {
  snapshot = snapshotEnv();
  root = fixtureRoot();

  for (const name of DECLARED) Reflect.deleteProperty(process.env, name);
});

afterEach(() => {
  restoreEnv(snapshot);
});

const messageFrom = (load: () => unknown): string => {
  try {
    load();
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }

  return "";
};

describe("loadEnv", () => {
  it("names every missing variable in one error", () => {
    const message = messageFrom(() => loadEnv(serviceEnv, root));

    expect(message).toContain("SERVICE_URL");
    expect(message).toContain("SERVICE_TOKEN");
    expect(message).toContain("SERVICE_SECRET");
    expect(message).toContain("3 problems");
  });

  it("reports a coerced number set to a non-numeric string as set, not missing", () => {
    process.env.PORT = "abc";

    const message = messageFrom(() => loadEnv({ PORT: z.coerce.number().int() }, root));

    expect(message).toContain("PORT");
    expect(message).toContain("set, but not a valid number");
  });

  it("never prints the value of a variable it rejects", () => {
    process.env.SERVICE_URL = "not-a-url-super-secret";

    const message = messageFrom(() => loadEnv(serviceEnv, root));

    expect(message).toContain("SERVICE_URL");
    expect(message).not.toContain("not-a-url-super-secret");
  });

  it("says what a refinement wanted, so a value of the wrong shape names itself", () => {
    process.env.SERVICE_KEY = "token_that_is_not_a_key";

    const message = messageFrom(() => loadEnv(keyedEnv, root));

    expect(message).toContain("SERVICE_KEY");
    expect(message).toContain("not a service key");
    expect(message).not.toContain("token_that_is_not_a_key");
  });

  it("defaults APP_ENV to dev", () => {
    expect(loadEnv(appEnv, root).APP_ENV).toBe("dev");
  });

  it("treats an empty variable as unset and removes it from process.env", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "";

    expect(loadEnv(appEnv, root).NEXT_PUBLIC_SITE_URL).toBe("http://localhost:3000");
    expect("NEXT_PUBLIC_SITE_URL" in process.env).toBe(false);
  });

  it("lets the root file fill a variable the shell left empty", () => {
    writeFileSync(join(root, ".env.dev"), "NEXT_PUBLIC_SITE_URL=https://example.com\n");
    process.env.NEXT_PUBLIC_SITE_URL = "";

    expect(loadEnv(appEnv, root).NEXT_PUBLIC_SITE_URL).toBe("https://example.com");
  });

  it("accepts a file copied from the example, with every value left empty", () => {
    writeFileSync(join(root, ".env.dev"), "NEXT_PUBLIC_SITE_URL=\n");

    expect(loadEnv(appEnv, root)).toEqual({
      APP_ENV: "dev",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
  });
});
