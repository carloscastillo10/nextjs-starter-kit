import { describe, expect, it } from "vitest";

import { fakeClerkKey } from "../testing/clerk-key.fixture";
import { clerkEnv } from "./clerk.schema";

describe("clerkEnv", () => {
  it("accepts a publishable key and a secret key in their own variables", () => {
    expect(clerkEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.safeParse(fakeClerkKey("pk")).success).toBe(
      true,
    );
    expect(clerkEnv.CLERK_SECRET_KEY.safeParse(fakeClerkKey("sk")).success).toBe(true);
  });

  it("refuses each key pasted into the other's variable", () => {
    expect(clerkEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.safeParse(fakeClerkKey("sk")).success).toBe(
      false,
    );
    expect(clerkEnv.CLERK_SECRET_KEY.safeParse(fakeClerkKey("pk")).success).toBe(false);
  });

  it("lets both keys be missing, so a build without them passes", () => {
    expect(clerkEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.safeParse(undefined).success).toBe(true);
    expect(clerkEnv.CLERK_SECRET_KEY.safeParse(undefined).success).toBe(true);
  });
});
