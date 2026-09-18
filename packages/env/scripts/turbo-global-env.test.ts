import { describe, expect, it } from "vitest";

import { checkGlobalEnv, declaredVariableNames } from "./turbo-global-env";

describe("checkGlobalEnv", () => {
  it("accepts a name a wildcard covers", () => {
    const result = checkGlobalEnv({ globalEnv: ["SERVICE_*"] }, ["SERVICE_TOKEN"]);

    expect(result).toEqual({ kind: "ok" });
  });

  it("reports a name no pattern covers", () => {
    const result = checkGlobalEnv({ globalEnv: ["SERVICE_*"] }, ["SERVICE_TOKEN", "APP_ENV"]);

    expect(result).toEqual({ kind: "missing-variables", missing: ["APP_ENV"] });
  });

  it("treats a wildcard as a prefix rather than a substring", () => {
    const result = checkGlobalEnv({ globalEnv: ["SERVICE_*"] }, ["NEXT_PUBLIC_SERVICE_URL"]);

    expect(result).toEqual({
      kind: "missing-variables",
      missing: ["NEXT_PUBLIC_SERVICE_URL"],
    });
  });

  it("honors an exclusion, which is what makes a broad wildcard readable", () => {
    const result = checkGlobalEnv({ globalEnv: ["SERVICE_*", "!SERVICE_TOKEN"] }, [
      "SERVICE_TOKEN",
    ]);

    expect(result).toEqual({ kind: "missing-variables", missing: ["SERVICE_TOKEN"] });
  });

  it("counts a name in globalPassThroughEnv, where a secret stays out of the hash", () => {
    const result = checkGlobalEnv(
      { globalEnv: ["APP_ENV"], globalPassThroughEnv: ["SERVICE_SECRET"] },
      ["APP_ENV", "SERVICE_SECRET"],
    );

    expect(result).toEqual({ kind: "ok" });
  });

  it("counts a name a task declares for itself", () => {
    const result = checkGlobalEnv(
      { globalEnv: ["APP_ENV"], tasks: { deploy: { passThroughEnv: ["DEPLOY_*"] } } },
      ["DEPLOY_TOKEN"],
    );

    expect(result).toEqual({ kind: "ok" });
  });

  it("reads an escaped asterisk as a literal one", () => {
    const result = checkGlobalEnv({ globalEnv: [String.raw`FOO\*`] }, ["FOOBAR"]);

    expect(result).toEqual({ kind: "missing-variables", missing: ["FOOBAR"] });
  });

  it("reports the key itself when the config carries no globalEnv", () => {
    expect(checkGlobalEnv({ tasks: {} }, ["APP_ENV"])).toEqual({ kind: "key-not-found" });
  });
});

describe("declaredVariableNames", () => {
  it("lists every variable the schemas declare, defaulted ones included", () => {
    expect(declaredVariableNames()).toEqual(["APP_ENV", "NEXT_PUBLIC_SITE_URL"]);
  });
});
