import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";

const currentYear = new Date().getFullYear();

export const addAgentSchema = z.object({
  agencyId: z.string().min(1, "Agency is required"),
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  title: z.enum(["SUPERAGENT", "AGENT EXCLUSIF", "AGENT"]),
  specialization: z.string().trim().min(1, "Specialization is required"),
  nationality: z.string().trim().min(1, "Nationality is required"),
  languages: z.string().trim().min(1, "At least one language required"),
  yearsExperience: z.number().int().min(0, "Must be 0 or more"),
  experienceSince: z
    .number()
    .int()
    .min(1900, "Must be after 1900")
    .max(currentYear, "Cannot be in the future"),
  rating: z.number().min(0, "Min 0").max(5, "Max 5"),
  ratingsCount: z.number().int().min(0, "Must be 0 or more"),
  responseMinutes: z.number().int().min(0, "Must be 0 or more"),
  brokerLicense: z.string().trim().min(1, "Broker license is required"),
  bio: z
    .string()
    .trim()
    .min(1, "Bio is required")
    .max(MAX_DESCRIPTION_LENGTH, `Bio must be ${MAX_DESCRIPTION_LENGTH} characters or less`),
  photo: z.string().trim().min(1, "Photo URL is required"),
  photoGradient: z.string().trim().min(1, "Photo gradient is required"),
  agencyAccent: z.string().trim().min(1, "Agency accent is required"),
  agencyMonogram: z.string().trim().min(1, "Agency monogram is required"),
});

export type AddAgentFormValues = z.infer<typeof addAgentSchema>;
