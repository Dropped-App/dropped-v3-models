import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { LocationModelSchema } from "./Location";
import { ImportLocationBodySchema } from "./LocationApi";

const ApiDateSchema = z.coerce.date().optional().nullable();

export const GoogleSheetSyncOperationTypeSchema = z.enum(["CREATE", "UPDATE", "DELETE"]);

export type GoogleSheetSyncOperationType = z.infer<typeof GoogleSheetSyncOperationTypeSchema>;

export const GoogleSheetSyncMappedRowSchema = z.object({
  externalId: z.string().min(1),
  location: ImportLocationBodySchema,
});

export type GoogleSheetSyncMappedRow = z.infer<typeof GoogleSheetSyncMappedRowSchema>;

export const GoogleSheetSyncOperationEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  sync: ObjectIdSchema,
  syncRow: ObjectIdSchema.optional().nullable(),
  operation: GoogleSheetSyncOperationTypeSchema,
  externalId: z.string().optional().nullable(),
  rowNumber: z.number().int().positive().optional().nullable(),
  rawRowData: z.record(z.string(), z.string()).optional().nullable(),
  mappedData: GoogleSheetSyncMappedRowSchema.optional().nullable(),
  locationId: ObjectIdSchema.optional().nullable(),
  previousLocation: LocationModelSchema.optional().nullable(),
  nextLocation: LocationModelSchema.optional().nullable(),
  happenedAt: z.date(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type GoogleSheetSyncOperationEntity = z.infer<typeof GoogleSheetSyncOperationEntitySchema>;

export const GoogleSheetSyncOperationModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  sync: z.string(),
  syncRow: z.string().optional().nullable(),
  operation: GoogleSheetSyncOperationTypeSchema,
  externalId: z.string().optional().nullable(),
  rowNumber: z.number().int().positive().optional().nullable(),
  rawRowData: z.record(z.string(), z.string()).optional().nullable(),
  mappedData: GoogleSheetSyncMappedRowSchema.optional().nullable(),
  locationId: z.string().optional().nullable(),
  previousLocation: LocationModelSchema.optional().nullable(),
  nextLocation: LocationModelSchema.optional().nullable(),
  happenedAt: ApiDateSchema,
  createdAt: ApiDateSchema,
  updatedAt: ApiDateSchema,
});

export type GoogleSheetSyncOperationModel = z.infer<typeof GoogleSheetSyncOperationModelSchema>;

export const GoogleSheetSyncOperationModel = {
  convertFromEntity(entity: GoogleSheetSyncOperationEntity): GoogleSheetSyncOperationModel {
    return GoogleSheetSyncOperationModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      sync: entity.sync.toHexString(),
      syncRow: entity.syncRow?.toHexString() ?? null,
      operation: entity.operation,
      externalId: entity.externalId ?? null,
      rowNumber: entity.rowNumber ?? null,
      rawRowData: entity.rawRowData ?? null,
      mappedData: entity.mappedData ?? null,
      locationId: entity.locationId?.toHexString() ?? null,
      previousLocation: entity.previousLocation ?? null,
      nextLocation: entity.nextLocation ?? null,
      happenedAt: entity.happenedAt ? new Date(entity.happenedAt) : null,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    });
  },
};
