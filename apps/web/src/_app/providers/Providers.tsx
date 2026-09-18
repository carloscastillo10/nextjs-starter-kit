import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => (
  <ThemeProvider disableTransitionOnChange enableSystem attribute="class" defaultTheme="system">
    {children}
  </ThemeProvider>
);
