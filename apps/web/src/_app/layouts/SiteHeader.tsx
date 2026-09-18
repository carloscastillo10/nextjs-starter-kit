import { Show, UserButton } from "@clerk/nextjs";
import { buttonVariants } from "@repo/ui/components/button";
import Link from "next/link";

import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/shared/auth";

/*
 * `Show` reads the session on the server, so the header arrives with the right controls
 * instead of switching them after Clerk loads. It hides markup only: a page that needs a
 * signed-in user still checks the session itself. The two controls navigate, so they are
 * links styled as buttons rather than buttons, which keeps the link role for screen readers.
 */
export const SiteHeader = () => (
  <header className="flex items-center justify-end gap-2 border-b px-4 py-3">
    <Show when="signed-out">
      <Link className={buttonVariants({ variant: "ghost" })} href={SIGN_IN_PATH}>
        Sign in
      </Link>
      <Link className={buttonVariants()} href={SIGN_UP_PATH}>
        Sign up
      </Link>
    </Show>
    <Show when="signed-in">
      <UserButton />
    </Show>
  </header>
);
