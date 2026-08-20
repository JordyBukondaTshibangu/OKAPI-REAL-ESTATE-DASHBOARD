import { z } from "zod";
import { addPropertySchema } from "../create-property/schema";

/**
 * Edit schema: same as the create schema but agentId/agencyId are optional
 * because the edit form does not expose agent/agency selector fields —
 * those are already set on the existing property record.
 */
export const editPropertySchema = addPropertySchema.extend({
  agentId: z.string().optional(),
  agencyId: z.string().optional(),
});

export type EditPropertyFormValues = z.infer<typeof editPropertySchema>;
