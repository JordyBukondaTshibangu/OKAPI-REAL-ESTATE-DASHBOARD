import { z } from "zod";

export const AGENT_TYPE_VALUES = ["COMMISSIONNAIRE", "AGENT", "AGENCY_OWNER", "OTHER"] as const;
export const RENTAL_FOCUS_VALUES = ["LONG_TERM", "SHORT_TERM", "BOTH"] as const;
export const VERIFICATION_TIER_VALUES = ["NON_VERIFIE", "VERIFIE"] as const;

export const COMMUNES_LIST = [
  "Gombe", "Limete", "Ngaliema", "Kalamu", "Ndjili",
  "Kintambo", "Barumbu", "Kinshasa", "Autre",
] as const;

export const PROPERTY_TYPES_LIST = [
  "Appartements", "Villas", "Studios", "Commerciaux", "Terrains", "Entrepôts",
] as const;

export const YEARS_EXP_LIST = [
  "Moins de 1 an", "1 à 3 ans", "3 à 5 ans", "Plus de 5 ans",
] as const;

export const addAgentSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Valid email required"),
  phoneNumber: z.string().trim().min(8, "Phone number required"),
  whatsapp: z.string().trim().optional(),
  agentType: z.enum(AGENT_TYPE_VALUES),
  agencyId: z.string().optional(),
  communes: z.array(z.string()).min(1, "Select at least one commune"),
  propertyTypes: z.array(z.string()).min(1, "Select at least one property type"),
  rentalFocus: z.enum(RENTAL_FOCUS_VALUES),
  yearsExperienceLabel: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  referredById: z.string().optional(),
  verificationTier: z.enum(VERIFICATION_TIER_VALUES).optional(),
  photo: z.string().optional(),
  bio: z.string().optional(),
  graceEndsAt: z.string().optional(),
  freeListingCap: z.number().int().min(0).optional(),
});

export type AddAgentFormValues = z.infer<typeof addAgentSchema>;
