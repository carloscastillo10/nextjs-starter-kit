import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import type { EnvSchema } from "../schemas";
import { ENV_SCHEMAS } from "../schemas";
import { fixtureRoot } from "../testing/workspace.fixture";
import { emitEnvExample, renderEnvExample } from "./env-example.emitter";

const SAMPLE: readonly EnvSchema[] = [
  {
    title: "Service",
    shape: {
      SERVICE_TOKEN: z.string().min(1),
      SERVICE_TIMEOUT: z.coerce.number().default(30),
      SERVICE_REGION: z.string().optional(),
      SERVICE_URL: z.url().default("http://localhost:8080").meta({ requiredWhenDeployed: true }),
    },
  },
  { title: "Defaults only", shape: { RETRIES: z.coerce.number().default(3) } },
  { title: "Queue", shape: { QUEUE_URL: z.url() } },
];

describe("renderEnvExample", () => {
  it("lists the variables of this repository, grouped, with no values", () => {
    expect(renderEnvExample(ENV_SCHEMAS)).toBe("# App\nNEXT_PUBLIC_SITE_URL=\n");
  });

  it("keeps what has to be supplied and leaves defaulted and optional knobs out", () => {
    const example = renderEnvExample(SAMPLE);

    expect(example).toContain("SERVICE_TOKEN=\n");
    expect(example).toContain("SERVICE_URL=\n");
    expect(example).not.toContain("SERVICE_TIMEOUT");
    expect(example).not.toContain("SERVICE_REGION");
  });

  it("drops a group left empty and separates the rest with a blank line", () => {
    expect(renderEnvExample(SAMPLE)).toBe(
      "# Service\nSERVICE_TOKEN=\nSERVICE_URL=\n\n# Queue\nQUEUE_URL=\n",
    );
  });
});

describe("emitEnvExample", () => {
  it("writes the rendered file at the root it is given", () => {
    const root = fixtureRoot();
    const path = emitEnvExample(root, SAMPLE);

    expect(path).toBe(join(root, ".env.example"));
    expect(readFileSync(path, "utf8")).toBe(renderEnvExample(SAMPLE));
  });
});
