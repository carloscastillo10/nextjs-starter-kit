import "@/_app/styles/globals.css";

import type { Metadata, Viewport } from "next";

import { fontSans } from "@/_app/fonts";
import { Providers } from "@/_app/providers";

export const metadata: Metadata = {
  title: "next-starter-kit",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html className={fontSans.variable} suppressHydrationWarning lang="en">
    <body>
      <Providers>{children}</Providers>
    </body>
  </html>
);

export default RootLayout;
