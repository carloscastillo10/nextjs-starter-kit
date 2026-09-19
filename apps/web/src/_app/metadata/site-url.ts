/*
 * The origin the root metadata resolves relative URLs against. The Next.js config validates
 * NEXT_PUBLIC_SITE_URL, applies its default and builds it into the bundles, so a missing value
 * means the app is running without that config, and relative URLs would quietly resolve against
 * whatever origin serves the page.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

if (siteUrl === undefined) {
  throw new Error("NEXT_PUBLIC_SITE_URL is unset: the Next.js config that builds it in never ran.");
}

export const SITE_URL = new URL(siteUrl);
