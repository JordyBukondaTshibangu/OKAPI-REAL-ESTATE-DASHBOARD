export enum SEARCH_TYPE {
  MEMBER = "Members",
  TEAM = "Teams",
  RESOURCE = "Resources",
  POLICY = "Policies",
  ROUTER = "Routers",
  AGENT = "Agents",
  AGENCY = "agencies",
  PROPERTY = "Properties",
}

export type QueryParams = {
  searchName?: string;
  searchEmail?: string;
  searchRegion?: string;
  searchAddrs?: string;

  search?: string;
  page?: number;
  pageSize?: number;
  status?: string;
  query?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";

  agentId?: string;
  agencyId?: string;

  // Agents-specific filters
  pending?: boolean;           // verificationTier=NON_VERIFIE&emailVerified=true
  verificationTier?: string;
};

export type PaginatedData<T> = {
  items: T[];
  activeItems?: T[];
  page: number | null;
  pageSize: number | null;
  totalCount: number | null;
  totalPages: number | null;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

export type ErrorResponse = {
  error: string;
  code?: string;
  details?: string;
};

export type Agency = {
  id: string;
  name: string;
  // Contact
  phone: string;
  email: string;
  website?: string;
  address?: string;
  whatsapp?: string;
  // New fields
  communes?: string[];
  propertyTypes?: string[];
  rentalFocus?: RentalFocus;
  rccmNumber?: string;
  verificationDocUrl?: string;
  logoUrl?: string;
  gracePeriodEndsAt?: string;
  freeListingCap?: number;
  description?: string;
  // Legacy (kept in DB, nullable)
  monogram?: string;
  accentClass?: string;
  tagline?: string;
  founded?: number;
  specializations?: string[];
  areasServed?: string[];
  languages?: string[];
  certifications?: string[];
  // Metadata
  agentCount?: number;
  listingCount?: number;
  closedDeals?: number;
  verificationTier?: "NON_VERIFIE" | "VERIFIE";
  createdAt?: string;
  agents?: Agent[];
};

export type AgentTitle = "SUPERAGENT" | "AGENT EXCLUSIF" | "AGENT";

export type AreaOfExpertise = {
  name: string;
  description: string;
  rating: number;
  ratings: number;
  forSale: number;
  forRent: number;
  closedDeals: number;
};

export type TrackRecordRow = {
  location: string;
  building: string;
  dealType: "Vente" | "Location";
  date: string;
  propertyType: string;
  bedrooms: string;
};

export type AgentPlan = "FREE" | "PRO" | "AGENCY";
export type AgentVerificationTier = "NON_VERIFIE" | "VERIFIE";
export type AgentType = "COMMISSIONNAIRE" | "AGENT" | "AGENCY_OWNER" | "OTHER";
export type RentalFocus = "LONG_TERM" | "SHORT_TERM" | "BOTH";

export type Agent = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  // New profile fields
  agentType?: AgentType;
  communes?: string[];
  propertyTypes?: string[];
  rentalFocus?: RentalFocus;
  yearsExperienceLabel?: string;
  idDocumentUrl?: string;
  referredById?: string;
  freeListingCap?: number;
  // Legacy fields (kept in DB, no longer shown in admin form)
  title?: string;
  specialization?: string;
  nationality?: string;
  languages?: string[];
  yearsExperience?: number;
  experienceSince?: number;
  rating?: number;
  ratingsCount?: number;
  responseMinutes?: number;
  brokerLicense?: string;
  photoGradient?: string;
  agencyMonogram?: string;
  agencyAccent?: string;
  // Relations
  agency?: unknown;
  forSaleCount?: number;
  forRentCount?: number;
  closedDeals?: number;
  totalDealsValueUsd?: number;
  bio?: string;
  photo?: string;
  areasOfExpertise?: AreaOfExpertise[];
  trackRecord?: TrackRecordRow[];
  // Self-signup / verification fields
  verificationTier?: AgentVerificationTier;
  emailVerified?: boolean;
  plan?: AgentPlan;
  isSuspended?: boolean;
  suspendedReason?: string;
  suspendedAt?: string;
  idDocumentStatus?: string;
  graceEndsAt?: string;
  agencyId?: string;
  createdAt?: string;
  verifiedAt?: string;
};

export type ListingType = "rent" | "sale" | "commercial";

export type CommercialTransaction = "rent" | "sale";

export type PropertyCategory =
  | "apartment"
  | "villa"
  | "townhouse"
  | "studio"
  | "duplex"
  | "penthouse"
  | "land"
  | "office"
  | "warehouse"
  | "retail";

export type PropertyPerformance = {
  viewed: number;
  shared: number;
  saved: number;
  whatsappClicks: number;
};

export type Property = {
  id: string;
  listingType: ListingType;
  category: PropertyCategory;
  price: number;
  currency: string;
  period: "monthly" | "yearly" | null;
  title: string;
  subtitle: string;
  bedrooms: number;
  bathrooms: number;
  areaSqm: number;
  suburb: string;
  neighborhood: string;
  city: string;
  verified: boolean;
  premium: boolean;
  isNew: boolean;
  listedDaysAgo: number;
  agent: { name: string; title: string; profile: string };
  imageGradient: string;
  iconType: "building" | "home" | "land" | "office" | "store" | "warehouse";
  transaction?: CommercialTransaction;
  gallery: string[];
  performance?: PropertyPerformance;
  isShortTerm?: boolean;
  isLongTerm?: boolean;
  pricePerNight?: number | null;
  minStayNights?: number | null;
  maxStayNights?: number | null;
  shortTermNotes?: string | null;
};

export type PropertyDetail = Property & {
  description: string;
  amenities: string[];
  reference: string;
  zone: string;
  agency: string;
  brokerLicense: string;
  agentLicense: string;
  permitNumber: string;
  availableFrom: string;
  averagePriceArea: number;
  averageSizeArea: number;
};

export type AuditLog = {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  createdAt: string;
  admin: { id: string; email: string } | null;
};

export type AuditLogParams = {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};
