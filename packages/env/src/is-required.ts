import type { z } from "zod";

export const isRequired = (field: z.ZodType): boolean => !field.safeParse(undefined).success;
