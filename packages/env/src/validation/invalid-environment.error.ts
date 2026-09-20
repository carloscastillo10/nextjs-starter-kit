import type { z } from "zod";

import { activeAppEnv } from "../loading/env-file";

/*
 * Only a coercion failure carries `received`, which tells it from a missing variable without
 * reading the value; zod reports both as invalid_type.
 */
const reasonFor = (issue: z.core.$ZodIssue): string => {
  if (issue.code === "invalid_type") {
    return "received" in issue ? `set, but not a valid ${issue.expected}` : "required, but missing";
  }

  if (issue.code === "invalid_value") return "not one of the accepted values";

  if (issue.code === "invalid_format") return `not a valid ${issue.format}`;

  if (issue.code === "custom") return issue.message;

  return "invalid";
};

const messageFor = (error: z.ZodError, path: string | null): string => {
  const problems = error.issues.map((issue) => ({
    name: String(issue.path[0] ?? "?"),
    reason: reasonFor(issue),
  }));
  const width = Math.max(...problems.map((problem) => problem.name.length));
  const where = path === null ? "no file found" : `loaded ${path}`;
  const count = problems.length === 1 ? "1 problem" : `${problems.length} problems`;

  return [
    `Invalid environment (APP_ENV=${activeAppEnv()}, ${where})`,
    "",
    ...problems.map((problem) => `  ${problem.name.padEnd(width)}  ${problem.reason}`),
    "",
    `${count}. See .env.example at the repository root for the full contract.`,
  ].join("\n");
};

export class InvalidEnvironmentError extends Error {
  constructor(error: z.ZodError, path: string | null) {
    super(messageFor(error, path));
    this.name = "InvalidEnvironmentError";
  }
}
