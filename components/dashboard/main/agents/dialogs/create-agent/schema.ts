import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";

export const addAgentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  specialization: z.string().trim().min(1, "Specialization is required"),
  agency: z.string().trim().min(1, "Agency is required"),
  nationality: z.string().trim().optional(),
  bio: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Bio must be ${MAX_DESCRIPTION_LENGTH} characters or less`)
    .optional()
    .nullable(),
});

export type AddAgentFormValues = z.infer<typeof addAgentSchema>;
