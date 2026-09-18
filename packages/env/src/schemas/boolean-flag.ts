import { z } from "zod";

/*
 * `z.coerce.boolean()` follows JavaScript truthiness, so the string "false" would come out
 * true. The two spellings are the contract, and anything else is rejected rather than guessed.
 */
export const booleanFlag = (fallback: "false" | "true") =>
  z
    .enum(["true", "false"])
    .default(fallback)
    .transform((value) => value === "true");
