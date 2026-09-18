import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "next-starter-kit",
};

const RootLayout = ({ children }: LayoutProps<"/">) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
