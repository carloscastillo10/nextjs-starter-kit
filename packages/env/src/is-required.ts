import type { z } from "zod";

// Required means zod rejects the variable when it is missing: no `.optional()`, no `.default()`.
export const isRequired = (field: z.ZodType): boolean => !field.safeParse(undefined).success;
