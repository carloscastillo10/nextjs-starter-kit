import type { z } from "zod";

import { appEnv } from "./app.schema";
import { clerkEnv } from "./clerk.schema";

export type EnvSchema = {
  readonly title: string;
  readonly shape: Readonly<Record<string, z.ZodType>>;
};

/*
 * One registry for every reader: the example file groups variables by title, and the Turborepo
 * check reads their names. A new provider is one more entry here.
 */
export const ENV_SCHEMAS: readonly EnvSchema[] = [
  { title: "App", shape: appEnv },
  { title: "Clerk", shape: clerkEnv },
];
