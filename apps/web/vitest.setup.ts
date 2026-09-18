import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

/*
 * Testing Library unmounts after each test on its own only when the test functions are
 * globals. They are imported here, so the cleanup is registered by hand.
 */
afterEach(cleanup);
