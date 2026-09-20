import type { z } from "zod";

import { appEnv } from "./app.schema";

export type EnvSchema = {
  readonly title: string;
  readonly shape: Readonly<Record<string, z.ZodType>>;
};

export const ENV_SCHEMAS: readonly EnvSchema[] = [{ title: "App", shape: appEnv }];
