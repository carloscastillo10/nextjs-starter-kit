import { describe, expect, it } from "vitest";

import { lintFsdRoots } from "./lint-fsd.mjs";

const passing = () => 0;

describe("lintFsdRoots", () => {
  it("lints every root, in the declared order", () => {
    const linted = [];

    lintFsdRoots({
      roots: ["apps/web/src", "packages/kit/src"],
      run: (root) => {
        linted.push(root);

        return 0;
      },
    });

    expect(linted).toEqual(["apps/web/src", "packages/kit/src"]);
  });

  it("passes when every root passes", () => {
    expect(lintFsdRoots({ roots: ["apps/web/src"], run: passing })).toEqual({
      failed: [],
      status: 0,
    });
  });

  it("fails naming the roots that failed", () => {
    expect(
      lintFsdRoots({
        roots: ["apps/web/src", "packages/kit/src", "packages/other/src"],
        run: (root) => (root === "apps/web/src" ? 0 : 1),
      }),
    ).toEqual({ failed: ["packages/kit/src", "packages/other/src"], status: 1 });
  });

  it("keeps linting after a root fails, so one run reports every root", () => {
    const linted = [];

    lintFsdRoots({
      roots: ["apps/web/src", "packages/kit/src"],
      run: (root) => {
        linted.push(root);

        return 1;
      },
    });

    expect(linted).toHaveLength(2);
  });

  it("fails when a root could not be linted at all", () => {
    expect(lintFsdRoots({ roots: ["apps/web/src"], run: () => null }).status).toBe(1);
  });

  it("refuses to pass when nothing was linted", () => {
    expect(() => lintFsdRoots({ roots: [], run: passing })).toThrow(/no FSD roots/u);
  });
});
