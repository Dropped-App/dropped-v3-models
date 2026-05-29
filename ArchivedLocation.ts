import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { LocationEntityResult } from "./Location";

export const ArchivedLocationReasonSchema = z.union([z.literal("BILLING_AUTO_TRIM")]);

export type ArchivedLocationReason = z.infer<typeof ArchivedLocationReasonSchema>;

export const ArchivedLocationEntityResult = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  locationId: ObjectIdSchema,
  location: LocationEntityResult,
  archiveReason: ArchivedLocationReasonSchema,
  archivedAt: z.date(),
  expireAt: z.date(),
});

export type ArchivedLocationEntity = z.infer<typeof ArchivedLocationEntityResult>;
