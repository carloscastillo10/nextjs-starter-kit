import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomePage } from "./HomePage";

test("renders the main landmark", () => {
  render(<HomePage />);

  expect(screen.getByRole("main")).toBeInstanceOf(HTMLElement);
});
