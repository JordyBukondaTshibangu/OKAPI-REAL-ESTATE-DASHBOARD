import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";

const currentYear = new Date().getFullYear();

export const addAgencySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  monogram: z.string().trim().min(1, "Monogram is required").max(5, "Max 5 characters"),
  accentClass: z.string().trim().min(1, "Accent class is required"),
  tagline: z.string().trim().min(1, "Tagline is required"),
  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(MAX_DESCRIPTION_LENGTH, `Max ${MAX_DESCRIPTION_LENGTH} characters`),
  address: z.string().trim().min(1, "Address is required"),
  phone: z.string().trim().min(1, "Phone is required"),
  email: z.string().trim().email("Invalid email address"),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  founded: z
    .number()
    .int("Must be a whole year")
    .min(1800, "Year must be after 1800")
    .max(currentYear, "Cannot be in the future"),
  specializations: z.string().trim().min(1, "At least one specialization required"),
  areasServed: z.string().trim().min(1, "At least one area required"),
  languages: z.string().trim().min(1, "At least one language required"),
  certifications: z.string().trim().optional(),
});

export type AddAgencyFormValues = z.infer<typeof addAgencySchema>;
