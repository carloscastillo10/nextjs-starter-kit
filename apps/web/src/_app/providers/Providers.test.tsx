import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

import { Providers } from "./Providers";

/*
 * Clerk's provider is a Server Component that needs real keys and a request. These tests
 * cover what the app composes around it, so it stands in as a pass-through.
 */
vi.mock("@clerk/nextjs", () => {
  const ClerkProvider = ({ children }: { children: ReactNode }) => children;

  return { ClerkProvider };
});

const DARK_SCHEME_QUERY = "(prefers-color-scheme: dark)";

const matchDarkScheme = (query: string) => ({
  matches: query === DARK_SCHEME_QUERY,
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  addListener: vi.fn(),
  dispatchEvent: vi.fn(),
  removeEventListener: vi.fn(),
  removeListener: vi.fn(),
});

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(matchDarkScheme));
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute("class");
  document.documentElement.removeAttribute("style");
});

test("renders its children", () => {
  render(
    <Providers>
      <p>content</p>
    </Providers>,
  );

  expect(screen.getByText("content")).toBeInstanceOf(HTMLElement);
});

test("sets the system color scheme as a class on the root element", () => {
  render(
    <Providers>
      <p>content</p>
    </Providers>,
  );

  expect(document.documentElement.classList.contains("dark")).toBe(true);
});
