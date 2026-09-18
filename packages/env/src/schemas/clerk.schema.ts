import { z } from "zod";

const PUBLISHABLE_KEY = /^pk_(?:test|live)_\S+$/u;
const SECRET_KEY = /^sk_(?:test|live)_\S+$/u;

/*
 * Both keys are optional so that a build without them (CI, a fresh clone) stays green, and
 * `requiredToRun` keeps them in the example file, because Clerk refuses to render a page
 * without them. The prefix check catches the two keys pasted into each other's variable,
 * which Clerk itself reports far less clearly.
 */
export const clerkEnv = {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .refine((key) => PUBLISHABLE_KEY.test(key), {
      error: "not a Clerk publishable key, which starts with pk_test or pk_live",
    })
    .optional()
    .meta({ requiredToRun: true }),
  CLERK_SECRET_KEY: z
    .string()
    .refine((key) => SECRET_KEY.test(key), {
      error: "not a Clerk secret key, which starts with sk_test or sk_live",
    })
    .optional()
    .meta({ requiredToRun: true }),
};
