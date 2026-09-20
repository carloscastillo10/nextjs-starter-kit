import { z } from "zod";

import { loadEnvFile } from "../loading/env-file";
import { InvalidEnvironmentError } from "./invalid-environment.error";

const unsetEmptyVariables = (names: readonly string[]): void => {
  for (const name of names) {
    if (process.env[name] === "") Reflect.deleteProperty(process.env, name);
  }
};

export const loadEnv = <Shape extends z.ZodRawShape>(
  shape: Shape,
  from: string = process.cwd(),
): z.infer<z.ZodObject<Shape>> => {
  const names = Object.keys(shape);

  unsetEmptyVariables(names);

  const path = loadEnvFile(from);

  unsetEmptyVariables(names);

  const result = z.object(shape).safeParse(process.env);

  if (!result.success) throw new InvalidEnvironmentError(result.error, path);

  return result.data;
};
