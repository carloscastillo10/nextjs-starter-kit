const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (siteUrl === undefined) {
  throw new Error("NEXT_PUBLIC_SITE_URL is unset: the Next.js config that builds it in never ran.");
}

export const SITE_URL = new URL(siteUrl);
