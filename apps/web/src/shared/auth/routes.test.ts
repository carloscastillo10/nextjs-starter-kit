import { existsSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "vitest";

import { SIGN_IN_PATH, SIGN_UP_PATH } from "./routes";

const APP_FOLDER = join(import.meta.dirname, "../../../app");

/*
 * Clerk's screens route their own steps under the path, so each path needs an optional
 * catch-all page. A renamed constant without a moved folder would send visitors to a 404.
 */
const catchAllPageFor = (path: string): string => {
  const segment = path.slice(1);

  return join(APP_FOLDER, segment, `[[...${segment}]]`, "page.tsx");
};

test.each([SIGN_IN_PATH, SIGN_UP_PATH])("%s has an optional catch-all page", (path) => {
  expect(existsSync(catchAllPageFor(path))).toBe(true);
});
