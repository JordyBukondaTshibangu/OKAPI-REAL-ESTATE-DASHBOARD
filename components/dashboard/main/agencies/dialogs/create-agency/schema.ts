import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";

export const addAgencySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  tagline: z.string().trim().optional(),
  email: z.string().trim().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`)
    .optional()
    .nullable(),
});

export type AddAgencyFormValues = z.infer<typeof addAgencySchema>;
