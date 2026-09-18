import { clerkMiddleware } from "@clerk/nextjs/server";

import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/shared/auth";

/*
 * Clerk reads the session on every request that reaches the app, and the paths tell it where
 * `auth.protect()` sends a signed-out visitor. It does not decide who may see a page: each
 * page, Route Handler and Server Action that needs a user checks the session itself.
 */
export const proxy = clerkMiddleware({ signInUrl: SIGN_IN_PATH, signUpUrl: SIGN_UP_PATH });

/*
 * Clerk's matcher: skip Next.js internals and static files unless a search param names them,
 * and always run for API routes and for Clerk's own frontend API path.
 */
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};
