import { appEnv, loadEnv } from "@repo/env";
import type { NextConfig } from "next";

/*
 * Runs before Next.js reads process.env for the build or the server. It loads the root env
 * file, so NEXT_PUBLIC_ values get inlined, and stops on a malformed variable. On a hosting
 * platform there is no file, and the platform's variables are used as they are.
 */
loadEnv(appEnv);

const nextConfig: NextConfig = {
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
