import type { ClerkProvider } from "@clerk/nextjs";
import type { ComponentProps } from "react";

type ClerkAppearance = NonNullable<ComponentProps<typeof ClerkProvider>["appearance"]>;

/*
 * Points Clerk's colors at the theme's CSS variables, so the auth screens and the user menu
 * follow the light and dark tokens with no palette of their own. The values mirror Clerk's
 * shadcn theme, whose package is left out because it installs a React Native and Solana
 * wallet tree the app never runs. Clerk's styles go in the components layer, which lets the
 * utility classes below override them.
 */
export const clerkAppearance: ClerkAppearance = {
  cssLayerName: "components",
  variables: {
    borderRadius: "var(--radius)",
    colorBackground: "var(--card)",
    colorDanger: "var(--destructive)",
    colorForeground: "var(--card-foreground)",
    colorInput: "var(--input)",
    colorInputForeground: "var(--card-foreground)",
    colorModalBackdrop: "rgb(0 0 0 / 50%)",
    colorMuted: "var(--muted)",
    colorMutedForeground: "var(--muted-foreground)",
    colorNeutral: "var(--foreground)",
    colorPrimary: "var(--primary)",
    colorPrimaryForeground: "var(--primary-foreground)",
    colorRing: "color-mix(in srgb, var(--ring), transparent 50%)",
  },
  elements: {
    button: { '&[data-variant="solid"]::after': { display: "none" } },
    cardBox: "border shadow-sm data-[elevation=flush]:border-0 data-[elevation=flush]:shadow-none",
    input: "bg-transparent dark:bg-input/30",
    popoverBox: "border shadow-sm",
  },
};
