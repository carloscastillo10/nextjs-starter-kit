/*
 * The origin the root metadata resolves relative URLs against. The Next.js config validates
 * NEXT_PUBLIC_SITE_URL, applies its default and builds it into the bundles, so it is missing
 * only where that config never ran, such as a test; Next.js then falls back to its own origin.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const SITE_URL = siteUrl === undefined ? undefined : new URL(siteUrl);
