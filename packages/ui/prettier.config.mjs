import { fileURLToPath } from "node:url";

import config from "@repo/prettier-config";

// The sorter orders utilities from the theme; the kit's own stylesheet only lists its files.
export default {
  ...config,
  tailwindStylesheet: fileURLToPath(import.meta.resolve("@repo/tailwind-config/theme.css")),
};
