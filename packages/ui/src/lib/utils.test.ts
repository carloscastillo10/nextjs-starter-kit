import { describe, expect, test } from "vitest";

import { cn } from "./utils";

describe("cn", () => {
  test("keeps the last class of a group", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("bg-primary", "bg-destructive")).toBe("bg-destructive");
    expect(cn("rounded-lg", "rounded-4xl")).toBe("rounded-4xl");
  });

  test("tells theme tokens apart from other utilities with the same prefix", () => {
    expect(cn("text-sm", "text-primary-foreground")).toBe("text-sm text-primary-foreground");
    expect(cn("border-border", "border-2")).toBe("border-border border-2");
    expect(cn("font-heading", "font-medium")).toBe("font-heading font-medium");
  });

  test("merges classes that share a variant", () => {
    expect(cn("hover:bg-primary/80", "hover:bg-accent")).toBe("hover:bg-accent");
  });

  test("skips falsy inputs and flattens objects and arrays", () => {
    const classesFor = (isActive: boolean) =>
      cn("base", isActive && "active", null, undefined, { "is-on": isActive }, ["a", ["b"]]);

    expect(classesFor(false)).toBe("base a b");
    expect(classesFor(true)).toBe("base active is-on a b");
  });
});
