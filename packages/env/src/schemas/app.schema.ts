import { z } from "zod";

export const appEnv = {
  APP_ENV: z.enum(["dev", "staging", "production"]).default("dev"),
  NEXT_PUBLIC_SITE_URL: z
    .url({ protocol: /^https?$/u })
    .default("http://localhost:3000")
    .meta({ requiredWhenDeployed: true }),
};
