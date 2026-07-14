import { z } from "zod";
import { MAX_DESCRIPTION_LENGTH } from "@/constants";

export const addPropertySchema = z.object({
  agentId: z.string().min(1, "Agent is required"),
  agencyId: z.string().min(1, "Agency is required"),
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
  price: z.number().min(0, "Must be positive"),
  currency: z.string().min(1, "Currency is required"),
  period: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title must be less than 150 characters"),
  subtitle: z.string().trim().min(1, "Subtitle is required"),
  bedrooms: z.number().int().min(0, "Must be 0 or more"),
  bathrooms: z.number().int().min(0, "Must be 0 or more"),
  areaSqm: z.number().min(0, "Must be positive"),
  suburb: z.string().trim().min(1, "Suburb is required"),
  neighborhood: z.string().trim().min(1, "Neighborhood is required"),
  city: z.string().trim().min(1, "City is required"),
  verified: z.boolean().optional(),
  premium: z.boolean().optional(),
  isNew: z.boolean().optional(),
  imageGradient: z.string().trim().min(1, "Image gradient is required"),
  iconType: z.enum(["building", "home", "land", "office", "store", "warehouse"]),
  transaction: z.string().optional(),
  gallery: z.string().trim().optional(),
  amenities: z.string().trim().min(1, "At least one amenity required"),
  description: z
    .string()
    .max(MAX_DESCRIPTION_LENGTH, `Max ${MAX_DESCRIPTION_LENGTH} characters`)
    .optional()
    .nullable(),
  reference: z.string().trim().optional(),
  zone: z.string().trim().optional(),
  brokerLicense: z.string().trim().optional(),
  agentLicense: z.string().trim().optional(),
  permitNumber: z.string().trim().optional(),
  availableFrom: z.string().trim().optional(),
  averagePriceArea: z.number().min(0).optional(),
  averageSizeArea: z.number().min(0).optional(),
  // Rental duration type
  isShortTerm: z.boolean().optional(),
  isLongTerm: z.boolean().optional(),
  // Short-term optional details
  pricePerNight: z.number().min(0).optional(),
  minStayNights: z.number().int().min(1).optional(),
  maxStayNights: z.number().int().min(1).optional(),
  shortTermNotes: z.string().trim().optional(),
  // Agent-facing fields
  landmark: z.string().trim().optional(),
  isFurnished: z.boolean().optional(),
});

export type AddPropertyFormValues = z.infer<typeof addPropertySchema>;
