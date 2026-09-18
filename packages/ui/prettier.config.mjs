import { fileURLToPath } from "node:url";

import config from "@repo/prettier-config";

/*
 * The class sorter needs the stylesheet that defines the theme to order its utilities.
 * The kit's own stylesheet only lists its files, so the sorter reads the shared theme.
 */
export default {
  ...config,
  tailwindStylesheet: fileURLToPath(import.meta.resolve("@repo/tailwind-config/theme.css")),
};
