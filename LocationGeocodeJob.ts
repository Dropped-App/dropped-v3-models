import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import type { ImportLocationsBulkOptions } from "./LocationApi";

export const LocationGeocodeJobCollection = "locationGeocodeJobs";

export const LocationGeocodeJobStatusSchema = z.union([
  z.literal("PENDING"),
  z.literal("PROCESSING"),
  z.literal("COMPLETED"),
  z.literal("FAILED"),
]);

export type LocationGeocodeJobStatus = z.infer<typeof LocationGeocodeJobStatusSchema>;

export const LocationGeocodeQueuedLocationSchema = z.object({
  id: z.string().min(1),
  formattedAddress: z.string().optional().nullable(),
});

export type LocationGeocodeQueuedLocation = z.infer<typeof LocationGeocodeQueuedLocationSchema>;

export const LocationImportGeocodeJobPayloadSchema = z.object({
  jobId: z.string().min(1),
  type: z.literal("LOCATION_IMPORT_GEOCODE"),
  orgId: z.string().min(1),
  locations: z.array(LocationGeocodeQueuedLocationSchema),
  options: z.object({
    parseFormattedAddress: z.boolean().optional().nullable(),
    resolveCoordinatesFromAddress: z.boolean().optional().nullable(),
  }) satisfies z.ZodType<
    Pick<ImportLocationsBulkOptions, "parseFormattedAddress" | "resolveCoordinatesFromAddress">
  >,
  requestedAt: z.string().min(1),
});

export type LocationImportGeocodeJobPayload = z.infer<typeof LocationImportGeocodeJobPayloadSchema>;

export const LocationGeocodeJobEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  type: z.literal("LOCATION_IMPORT_GEOCODE"),
  status: LocationGeocodeJobStatusSchema,
  locationIds: z.array(z.string().min(1)),
  formattedAddressesById: z.record(z.string(), z.string().nullable()).optional().nullable(),
  options: LocationImportGeocodeJobPayloadSchema.shape.options,
  requestedAt: z.date(),
  startedAt: z.date().optional().nullable(),
  completedAt: z.date().optional().nullable(),
  failedAt: z.date().optional().nullable(),
  error: z.string().optional().nullable(),
});

export type LocationGeocodeJobEntity = z.infer<typeof LocationGeocodeJobEntitySchema>;
