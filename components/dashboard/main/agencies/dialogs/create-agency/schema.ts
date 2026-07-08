import { z } from "zod";

export const RENTAL_FOCUS_VALUES = ["LONG_TERM", "SHORT_TERM", "BOTH"] as const;
export const VERIFICATION_TIER_VALUES = ["NON_VERIFIE", "VERIFIE"] as const;

export const COMMUNES_LIST = [
  "Gombe", "Limete", "Ngaliema", "Kalamu", "Ndjili",
  "Kintambo", "Barumbu", "Kinshasa", "Autre",
] as const;

export const PROPERTY_TYPES_LIST = [
  "Appartements", "Villas", "Studios", "Commerciaux", "Terrains", "Entrepôts",
] as const;

const CURRENT_YEAR = new Date().getFullYear();

export const LANGUAGES_LIST = [
  "Français", "Lingala", "Swahili", "Kikongo", "Tshiluba", "English",
] as const;

export const addAgencySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  monogram: z.string().trim().max(6, "Max 6 characters").optional(),
  tagline: z.string().trim().max(120, "Max 120 characters").optional(),
  email: z.string().trim().email("Valid email required"),
  phone: z.string().trim().min(8, "Phone is required"),
  whatsapp: z.string().trim().optional(),
  foundedYear: z
    .number()
    .int()
    .min(1900)
    .max(CURRENT_YEAR)
    .optional()
    .or(z.literal(undefined)),
  address: z.string().trim().optional(),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  description: z.string().trim().optional(),
  communes: z.array(z.string()),
  propertyTypes: z.array(z.string()),
  rentalFocus: z.enum(RENTAL_FOCUS_VALUES),
  languages: z.array(z.string()),
  rccmNumber: z.string().trim().optional(),
  verificationDocUrl: z.string().trim().optional(),
  logoUrl: z.string().trim().optional(),
  gracePeriodEndsAt: z.string().optional(),
  freeListingCap: z.number().int().min(0).optional(),
  verificationTier: z.enum(VERIFICATION_TIER_VALUES).optional(),
});

export type AddAgencyFormValues = z.infer<typeof addAgencySchema>;
