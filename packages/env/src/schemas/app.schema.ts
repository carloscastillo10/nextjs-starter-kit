import { z } from "zod";

export const appEnv = {
  // Picks the root env file the loader reads; left unset, that is the development file.
  APP_ENV: z.enum(["dev", "staging", "production"]).default("dev"),
  /*
   * The public origin the app is served from, which the root metadata resolves relative URLs
   * (Open Graph images, canonical links) against. The default fits the local server only, so
   * every deployment sets its own value.
   */
  NEXT_PUBLIC_SITE_URL: z
    .url({ protocol: /^https?$/u })
    .default("http://localhost:3000")
    .meta({ requiredWhenDeployed: true }),
};
