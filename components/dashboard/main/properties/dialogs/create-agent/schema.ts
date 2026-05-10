import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";

export const addPropertySchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must be less than 150 characters"),
  listingType: z.enum(["rent", "sale", "commercial"]),
  category: z.enum([
    "apartment",
    "villa",
    "townhouse",
    "studio",
    "duplex",
    "penthouse",
    "land",
    "office",
    "warehouse",
    "retail",
  ]),
  price: z.number().min(0, "Price must be positive"),
  currency: z.string().min(1, "Currency is required"),
  city: z.string().trim().min(1, "City is required"),
  suburb: z.string().trim().optional(),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Description must be ${MAX_DESCRIPTION_LENGTH} characters or less`)
    .optional()
    .nullable(),
});

export type AddPropertyFormValues = z.infer<typeof addPropertySchema>;
