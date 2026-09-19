import Image from "next/image";

import { HOME_LINKS } from "../config/home-links";
import { HomeActions } from "./HomeActions";

export const HomePage = () => (
  <div className="flex min-h-dvh flex-col items-center bg-muted">
    <main className="flex w-full max-w-3xl flex-1 flex-col items-center justify-between gap-16 bg-background px-8 py-24 sm:items-start sm:px-16 sm:py-32">
      <Image
        className="h-5 w-25 dark:invert"
        priority
        alt="Next.js logo"
        height={20}
        src="/next.svg"
        width={100}
      />

      <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <h1 className="max-w-2xl text-3xl/10 font-semibold tracking-tight text-balance">
          To get started, edit the{" "}
          <code
            className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-xl wrap-anywhere"
            translate="no"
          >
            apps/web/src/_pages/home/ui/HomePage.tsx
          </code>{" "}
          file.
        </h1>

        <p className="max-w-md text-lg/8 text-muted-foreground">
          Looking for a starting point or more instructions? Head over to{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4 hover:decoration-2"
            href={HOME_LINKS.templates}
          >
            Templates
          </a>{" "}
          or the{" "}
          <a
            className="font-medium text-foreground underline underline-offset-4 hover:decoration-2"
            href={HOME_LINKS.learn}
          >
            Learning
          </a>{" "}
          center.
        </p>
      </div>

      <HomeActions />
    </main>
  </div>
);
