import { z } from "zod";

export const booleanFlag = (fallback: "false" | "true") =>
  z
    .enum(["true", "false"])
    .default(fallback)
    .transform((value) => value === "true");
