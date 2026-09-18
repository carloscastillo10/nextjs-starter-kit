import { writeFileSync } from "node:fs";
import { join } from "node:path";

import type { z } from "zod";

import { isRequired } from "../is-required";
import type { EnvSchema } from "../schemas";

/*
 * A variable with a default is a knob, not a setting somebody has to supply, so it stays out:
 * a commented-out line only reads as one more thing to uncomment. `requiredWhenDeployed` brings
 * back what zod cannot express, a variable whose default only fits a developer's own machine.
 */
const belongsInTheExample = (field: z.ZodType): boolean =>
  isRequired(field) || field.meta()?.requiredWhenDeployed === true;

// Every line is a value somebody has to supply, so the file carries no comment but group names.
export const renderEnvExample = (schemas: readonly EnvSchema[]): string => {
  const groups = schemas.flatMap(({ title, shape }) => {
    const lines = Object.entries(shape)
      .filter(([, field]) => belongsInTheExample(field))
      .map(([name]) => `${name}=`);

    return lines.length === 0 ? [] : [`# ${title}\n${lines.join("\n")}`];
  });

  return `${groups.join("\n\n")}\n`;
};

export const emitEnvExample = (root: string, schemas: readonly EnvSchema[]): string => {
  const path = join(root, ".env.example");

  writeFileSync(path, renderEnvExample(schemas));

  return path;
};
