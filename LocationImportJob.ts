import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import {
  ImportLocationBodySchema,
  ImportLocationsBulkOptionsSchema,
  ImportLocationsBulkSkippedSchema,
} from "./LocationApi";

const ApiDateSchema = z.coerce.date().optional().nullable();

export const LocationImportJobCollection = "locationImportJobs";

export const LocationImportJobStatusSchema = z.union([
  z.literal("PENDING"),
  z.literal("PROCESSING"),
  z.literal("COMPLETED"),
  z.literal("FAILED"),
]);

export type LocationImportJobStatus = z.infer<typeof LocationImportJobStatusSchema>;

export const LocationImportJobOperationSchema = z.union([
  z.literal("CREATE"),
  z.literal("UPDATE"),
]);

export type LocationImportJobOperation = z.infer<typeof LocationImportJobOperationSchema>;

export const LocationImportJobQueuedRowSchema = z.object({
  row: z.number().int().positive(),
  operation: LocationImportJobOperationSchema,
  targetLocationId: z.string().min(1),
  existingLocationId: z.string().min(1).optional().nullable(),
  location: ImportLocationBodySchema,
});

export type LocationImportJobQueuedRow = z.infer<typeof LocationImportJobQueuedRowSchema>;

export const LocationImportJobResultSchema = z.object({
  createdLocationIds: z.array(z.string().min(1)),
  updatedLocationIds: z.array(z.string().min(1)),
  geocodeQueuedCount: z.number().int().nonnegative(),
});

export type LocationImportJobResult = z.infer<typeof LocationImportJobResultSchema>;

export const LocationImportJobPayloadSchema = z.object({
  jobId: z.string().min(1),
  type: z.literal("LOCATION_IMPORT"),
  orgId: z.string().min(1),
  requestedAt: z.string().min(1),
});

export type LocationImportJobPayload = z.infer<typeof LocationImportJobPayloadSchema>;

export const LocationImportJobEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  status: LocationImportJobStatusSchema,
  options: ImportLocationsBulkOptionsSchema.optional().nullable(),
  totalRows: z.number().int().positive(),
  queuedRows: z.array(LocationImportJobQueuedRowSchema),
  queuedCount: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  updatedCount: z.number().int().nonnegative(),
  skipped: z.array(ImportLocationsBulkSkippedSchema),
  result: LocationImportJobResultSchema.optional().nullable(),
  requestedAt: z.date(),
  startedAt: z.date().optional().nullable(),
  completedAt: z.date().optional().nullable(),
  failedAt: z.date().optional().nullable(),
  error: z.string().optional().nullable(),
});

export type LocationImportJobEntity = z.infer<typeof LocationImportJobEntitySchema>;

export const LocationImportJobModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  status: LocationImportJobStatusSchema,
  options: ImportLocationsBulkOptionsSchema.optional().nullable(),
  totalRows: z.number().int().positive(),
  queuedCount: z.number().int().nonnegative(),
  createdCount: z.number().int().nonnegative(),
  updatedCount: z.number().int().nonnegative(),
  skipped: z.array(ImportLocationsBulkSkippedSchema),
  result: LocationImportJobResultSchema.optional().nullable(),
  requestedAt: ApiDateSchema,
  startedAt: ApiDateSchema,
  completedAt: ApiDateSchema,
  failedAt: ApiDateSchema,
  error: z.string().optional().nullable(),
});

export type LocationImportJobModel = z.infer<typeof LocationImportJobModelSchema>;

export const LocationImportJobModel = {
  convertFromEntity(entity: LocationImportJobEntity): LocationImportJobModel {
    return LocationImportJobModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      status: entity.status,
      options: entity.options ?? null,
      totalRows: entity.totalRows,
      queuedCount: entity.queuedCount,
      createdCount: entity.createdCount,
      updatedCount: entity.updatedCount,
      skipped: entity.skipped,
      result: entity.result ?? null,
      requestedAt: entity.requestedAt,
      startedAt: entity.startedAt ?? null,
      completedAt: entity.completedAt ?? null,
      failedAt: entity.failedAt ?? null,
      error: entity.error ?? null,
    });
  },
};
