import { appEnv, loadEnv } from "@repo/env";
import type { NextConfig } from "next";

/*
 * Runs before Next.js reads process.env for the build or the server. It loads the root env
 * file and stops on a malformed variable. On a hosting platform there is no file, and the
 * platform's variables are used as they are.
 */
const env = loadEnv(appEnv);

const nextConfig: NextConfig = {
  // Builds the validated value, default included, into the bundles; a zod default never reaches process.env.
  env: { NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL },
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
