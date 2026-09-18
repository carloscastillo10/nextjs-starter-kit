import { describe, expect, it } from "vitest";

import { appEnv } from "./app.schema";

const siteUrl = appEnv.NEXT_PUBLIC_SITE_URL;

describe("NEXT_PUBLIC_SITE_URL", () => {
  it("falls back to the local development server", () => {
    expect(siteUrl.parse(undefined)).toBe("http://localhost:3000");
  });

  it("accepts an https origin", () => {
    expect(siteUrl.parse("https://example.com")).toBe("https://example.com");
  });

  it("refuses a value that is not a URL", () => {
    expect(siteUrl.safeParse("example.com").success).toBe(false);
  });

  it("refuses a URL that a browser does not load a page from", () => {
    expect(siteUrl.safeParse("ftp://example.com").success).toBe(false);
  });
});
