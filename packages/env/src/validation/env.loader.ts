import { z } from "zod";

import { loadEnvFile } from "../loading/env-file";
import { InvalidEnvironmentError } from "./invalid-environment.error";

/*
 * CI hands an unset secret over as an empty string, and a file copied from the example carries
 * empty values. Deleting them makes empty mean unset everywhere: an optional variable validates,
 * the root file can still fill what the shell left empty, and a library that tells a missing
 * value from an empty one sees it missing.
 */
const unsetEmptyVariables = (names: readonly string[]): void => {
  for (const name of names) {
    if (process.env[name] === "") Reflect.deleteProperty(process.env, name);
  }
};

// Loads the root env file, then validates every variable of the shape, reporting all problems.
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
