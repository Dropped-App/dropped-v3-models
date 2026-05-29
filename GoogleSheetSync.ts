import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { LocationCustomFieldTypeResult, LocationStatusResult } from "./Location";

const ApiDateSchema = z.coerce.date().optional().nullable();

export const GoogleSheetSyncStatusSchema = z
  .enum(["PENDING_AUTH", "CONNECTED", "ACTIVE", "ERROR", "DISCONNECTED"])
  .optional()
  .nullable();

export type GoogleSheetSyncStatus = z.infer<typeof GoogleSheetSyncStatusSchema>;

export const GoogleSheetSyncTokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional().nullable(),
  expiresAt: ApiDateSchema,
});

export type GoogleSheetSyncToken = z.infer<typeof GoogleSheetSyncTokenSchema>;

export const GoogleSheetSyncOptionsSchema = z.object({
  deleteMissingRows: z.boolean().optional().nullable(),
  matchExistingByAddressOrCoordinates: z.boolean().optional().nullable(),
  resolveCoordinatesFromAddress: z.boolean().optional().nullable(),
  parseFormattedAddress: z.boolean().optional().nullable(),
});

export type GoogleSheetSyncOptions = z.infer<typeof GoogleSheetSyncOptionsSchema>;

export const GoogleSheetLocationFieldSchema = z.enum([
  "status",
  "name",
  "formattedAddress",
  "addressLine1",
  "addressLine2",
  "city",
  "postalCode",
  "stateProvince",
  "country",
  "phoneNumber",
  "website",
  "emailAddress",
  "logoUrl",
  "notes",
  "priority",
  "suppressWarnings",
  "latitude",
  "longitude",
]);

export type GoogleSheetLocationField = z.infer<typeof GoogleSheetLocationFieldSchema>;

export const GoogleSheetSyncLocationFieldMappingSchema = z.object({
  kind: z.literal("LOCATION_FIELD"),
  sourceColumn: z.string().min(1),
  field: GoogleSheetLocationFieldSchema,
});

export const GoogleSheetSyncCustomFieldMappingSchema = z.object({
  kind: z.literal("CUSTOM_FIELD"),
  sourceColumn: z.string().min(1),
  key: z.string().optional().nullable(),
  label: z.string().optional().nullable(),
  type: LocationCustomFieldTypeResult,
  showOnListing: z.boolean().optional().nullable(),
});

export const GoogleSheetSyncFilterMappingSchema = z.object({
  kind: z.literal("FILTER"),
  sourceColumn: z.string().min(1),
  key: z.string().optional().nullable(),
});

export const GoogleSheetSyncMappingSchema = z.discriminatedUnion("kind", [
  GoogleSheetSyncLocationFieldMappingSchema,
  GoogleSheetSyncCustomFieldMappingSchema,
  GoogleSheetSyncFilterMappingSchema,
]);

export type GoogleSheetSyncMapping = z.infer<typeof GoogleSheetSyncMappingSchema>;

export const GoogleSheetSyncEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  status: GoogleSheetSyncStatusSchema,
  googleEmail: z.string().email().optional().nullable(),
  spreadsheetId: z.string().optional().nullable(),
  spreadsheetName: z.string().optional().nullable(),
  spreadsheetUrl: z.string().url().optional().nullable(),
  sheetId: z.number().int().optional().nullable(),
  sheetName: z.string().optional().nullable(),
  headerRow: z.number().int().positive().optional().nullable(),
  dataStartRow: z.number().int().positive().optional().nullable(),
  externalIdColumn: z.string().optional().nullable(),
  externalIdFallbackStatus: LocationStatusResult,
  mappings: z.array(GoogleSheetSyncMappingSchema).optional().nullable(),
  options: GoogleSheetSyncOptionsSchema.optional().nullable(),
  token: GoogleSheetSyncTokenSchema.optional().nullable(),
  lastCheckedAt: ApiDateSchema,
  lastSourceModifiedAt: ApiDateSchema,
  lastSourceVersion: z.string().optional().nullable(),
  syncLeaseToken: z.string().optional().nullable(),
  syncLeaseExpiresAt: ApiDateSchema,
  lastSyncedAt: ApiDateSchema,
  lastErrorAt: ApiDateSchema,
  lastErrorMessage: z.string().optional().nullable(),
  errorNotificationsEnabled: z.boolean().optional().nullable(),
  createdAt: ApiDateSchema,
  updatedAt: ApiDateSchema,
});

export type GoogleSheetSyncEntity = z.infer<typeof GoogleSheetSyncEntitySchema>;

export const GoogleSheetSyncModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  status: GoogleSheetSyncStatusSchema,
  googleEmail: GoogleSheetSyncEntitySchema.shape.googleEmail,
  spreadsheetId: GoogleSheetSyncEntitySchema.shape.spreadsheetId,
  spreadsheetName: GoogleSheetSyncEntitySchema.shape.spreadsheetName,
  spreadsheetUrl: GoogleSheetSyncEntitySchema.shape.spreadsheetUrl,
  sheetId: GoogleSheetSyncEntitySchema.shape.sheetId,
  sheetName: GoogleSheetSyncEntitySchema.shape.sheetName,
  headerRow: GoogleSheetSyncEntitySchema.shape.headerRow,
  dataStartRow: GoogleSheetSyncEntitySchema.shape.dataStartRow,
  externalIdColumn: GoogleSheetSyncEntitySchema.shape.externalIdColumn,
  externalIdFallbackStatus: GoogleSheetSyncEntitySchema.shape.externalIdFallbackStatus,
  mappings: GoogleSheetSyncEntitySchema.shape.mappings,
  options: GoogleSheetSyncEntitySchema.shape.options,
  lastCheckedAt: GoogleSheetSyncEntitySchema.shape.lastCheckedAt,
  lastSourceModifiedAt: GoogleSheetSyncEntitySchema.shape.lastSourceModifiedAt,
  lastSyncedAt: GoogleSheetSyncEntitySchema.shape.lastSyncedAt,
  lastErrorAt: GoogleSheetSyncEntitySchema.shape.lastErrorAt,
  lastErrorMessage: GoogleSheetSyncEntitySchema.shape.lastErrorMessage,
  errorNotificationsEnabled: GoogleSheetSyncEntitySchema.shape.errorNotificationsEnabled,
  createdAt: GoogleSheetSyncEntitySchema.shape.createdAt,
  updatedAt: GoogleSheetSyncEntitySchema.shape.updatedAt,
});

export type GoogleSheetSyncModel = z.infer<typeof GoogleSheetSyncModelSchema>;

export const GoogleSheetSyncModel = {
  convertFromEntity(entity: GoogleSheetSyncEntity): GoogleSheetSyncModel {
    return GoogleSheetSyncModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      status: entity.status ?? "PENDING_AUTH",
      googleEmail: entity.googleEmail ?? null,
      spreadsheetId: entity.spreadsheetId ?? null,
      spreadsheetName: entity.spreadsheetName ?? null,
      spreadsheetUrl: entity.spreadsheetUrl ?? null,
      sheetId: entity.sheetId ?? null,
      sheetName: entity.sheetName ?? null,
      headerRow: entity.headerRow ?? null,
      dataStartRow: entity.dataStartRow ?? null,
      externalIdColumn: entity.externalIdColumn ?? null,
      externalIdFallbackStatus: entity.externalIdFallbackStatus ?? "ACTIVE",
      mappings: entity.mappings ?? null,
      options: entity.options ?? null,
      lastCheckedAt: entity.lastCheckedAt ? new Date(entity.lastCheckedAt) : null,
      lastSourceModifiedAt: entity.lastSourceModifiedAt
        ? new Date(entity.lastSourceModifiedAt)
        : null,
      lastSyncedAt: entity.lastSyncedAt ? new Date(entity.lastSyncedAt) : null,
      lastErrorAt: entity.lastErrorAt ? new Date(entity.lastErrorAt) : null,
      lastErrorMessage: entity.lastErrorMessage ?? null,
      errorNotificationsEnabled: entity.errorNotificationsEnabled ?? true,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    });
  },
};
