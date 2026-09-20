import { appEnv, loadEnv } from "@repo/env";
import type { NextConfig } from "next";

const env = loadEnv(appEnv);

// A zod default never reaches process.env, so the validated values are built in from here.
const publicEnv = Object.fromEntries(
  Object.entries(env).filter(([name]) => name.startsWith("NEXT_PUBLIC_")),
);

const nextConfig: NextConfig = {
  env: publicEnv,
  transpilePackages: ["@repo/ui"],
};

export default nextConfig;
