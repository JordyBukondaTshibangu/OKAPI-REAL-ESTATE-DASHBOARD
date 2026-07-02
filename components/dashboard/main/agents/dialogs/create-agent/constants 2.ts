export const AGENT_SPECIALIZATIONS = [
  { label: "Residential",      value: "Residential" },
  { label: "Commercial",       value: "Commercial" },
  { label: "Luxury",           value: "Luxury" },
  { label: "Industrial",       value: "Industrial" },
  { label: "Retail",           value: "Retail" },
  { label: "Office",           value: "Office" },
  { label: "Land & Plots",     value: "Land & Plots" },
  { label: "Mixed-Use",        value: "Mixed-Use" },
  { label: "Hospitality",      value: "Hospitality" },
  { label: "Investment",       value: "Investment" },
  { label: "New Development",  value: "New Development" },
  { label: "Rental",           value: "Rental" },
  { label: "Short-Term Rental",value: "Short-Term Rental" },
  { label: "Off-Plan",         value: "Off-Plan" },
  { label: "Property Management", value: "Property Management" },
] as const;

export type AgentSpecialization = typeof AGENT_SPECIALIZATIONS[number]["value"];
