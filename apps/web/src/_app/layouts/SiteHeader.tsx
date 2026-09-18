import { Show, UserButton } from "@clerk/nextjs";
import { Button } from "@repo/ui/components/button";
import Link from "next/link";

import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/shared/auth";

/*
 * `Show` reads the session on the server, so the header arrives with the right controls
 * instead of switching them after Clerk loads. It hides markup only: a page that needs a
 * signed-in user still checks the session itself.
 */
export const SiteHeader = () => (
  <header className="flex items-center justify-end gap-2 border-b px-4 py-3">
    <Show when="signed-out">
      <Button nativeButton={false} render={<Link href={SIGN_IN_PATH} />} variant="ghost">
        Sign in
      </Button>
      <Button nativeButton={false} render={<Link href={SIGN_UP_PATH} />}>
        Sign up
      </Button>
    </Show>
    <Show when="signed-in">
      <UserButton />
    </Show>
  </header>
);
