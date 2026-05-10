import { z } from "zod";

import { MAX_DESCRIPTION_LENGTH } from "@/constants";

export const addRouterSchema = z.object({
  routerName: z
    .string()
    .trim()
    .min(2, "Router name must be at least 2 characters")
    .max(50, "Router name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9 ]+$/, "Invalid name"),

  routerDescription: z
    .string()
    .max(
      MAX_DESCRIPTION_LENGTH,
      `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`
    )
    .optional()
    .nullable(),

  environmentType: z.string().nonempty(),
});

export const refineRouterSchema = addRouterSchema;

export type AddRouterFormValues = z.infer<typeof addRouterSchema>;
