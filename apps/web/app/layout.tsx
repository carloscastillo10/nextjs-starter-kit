import "@/_app/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { fontSans } from "@/_app/fonts";
import { Providers } from "@/_app/providers";

export const metadata: Metadata = {
  title: "nextjs-starter-kit",
};

/*
 * The browser tints its own toolbar with these colors before the page styles load, so
 * they repeat the page background of the light and dark themes.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "oklch(1 0 0)" },
    { media: "(prefers-color-scheme: dark)", color: "oklch(0.145 0 0)" },
  ],
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html className={fontSans.variable} suppressHydrationWarning lang="en">
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
