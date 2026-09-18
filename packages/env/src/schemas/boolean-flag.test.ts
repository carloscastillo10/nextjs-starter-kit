import { describe, expect, it } from "vitest";

import { booleanFlag } from "./boolean-flag";

describe("booleanFlag", () => {
  it("reads the string false as the boolean false", () => {
    expect(booleanFlag("true").parse("false")).toBe(false);
  });

  it("reads the string true as the boolean true", () => {
    expect(booleanFlag("false").parse("true")).toBe(true);
  });

  it("falls back to its default when the variable is unset", () => {
    expect(booleanFlag("true").parse(undefined)).toBe(true);
  });

  it("rejects any other spelling instead of guessing", () => {
    expect(booleanFlag("false").safeParse("1").success).toBe(false);
  });
});
