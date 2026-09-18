import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

import { SIGN_IN_PATH, SIGN_UP_PATH } from "@/shared/auth";

import { clerkAppearance } from "./clerk-appearance";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => (
  <ClerkProvider appearance={clerkAppearance} signInUrl={SIGN_IN_PATH} signUpUrl={SIGN_UP_PATH}>
    <ThemeProvider disableTransitionOnChange enableSystem attribute="class" defaultTheme="system">
      {children}
    </ThemeProvider>
  </ClerkProvider>
);
