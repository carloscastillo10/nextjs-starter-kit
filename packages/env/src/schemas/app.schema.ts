import { z } from "zod";

// Picks the root env file the loader reads; left unset, that is the development file.
export const appEnv = {
  APP_ENV: z.enum(["dev", "staging", "production"]).default("dev"),
};
