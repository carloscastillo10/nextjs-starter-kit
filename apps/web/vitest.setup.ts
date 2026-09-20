import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Testing Library unmounts on its own only for global test functions; these are imported.
afterEach(cleanup);
