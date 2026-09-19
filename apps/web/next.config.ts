import { appEnv, loadEnv } from "@repo/env";
import type { NextConfig } from "next";

/*
 * Runs before Next.js reads process.env for the build or the server. It loads the root env
 * file and stops on a malformed variable. On a hosting platform there is no file, and the
 * platform's variables are used as they are.
 */
const env = loadEnv(appEnv);

/*
 * Builds the validated values, defaults included, into the bundles: a zod default never reaches
 * process.env. The names come from the schema, so the map cannot fall behind it.
 */
const publicEnv = Object.fromEntries(
  Object.entries(env).filter(([name]) => name.startsWith("NEXT_PUBLIC_")),
);

const nextConfig: NextConfig = {
  env: publicEnv,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
