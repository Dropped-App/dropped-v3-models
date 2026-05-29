import { z } from "zod";

import {
  GoogleSheetSyncMappingSchema,
  GoogleSheetSyncModelSchema,
  GoogleSheetSyncOptionsSchema,
} from "./GoogleSheetSync";
import {
  GoogleSheetSyncOperationModelSchema,
  GoogleSheetSyncOperationTypeSchema,
} from "./GoogleSheetSyncOperation";
import { LocationStatusResult } from "./Location";
import { normaliseOptionalQueryString, parseJsonBody, throwZodQueryError } from "./apiParsing";

export const GoogleSheetReferenceSchema = z.object({
  id: z.number().int().nonnegative(),
  name: z.string().min(1),
});

export type GoogleSheetReference = z.infer<typeof GoogleSheetReferenceSchema>;

export const GoogleSpreadsheetReferenceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  url: z.string().url(),
});

export type GoogleSpreadsheetReference = z.infer<typeof GoogleSpreadsheetReferenceSchema>;

export const ConfigureGoogleSheetSyncBodySchema = z.object({
  spreadsheetId: z.string().min(1),
  spreadsheetName: z.string().min(1),
  spreadsheetUrl: z.string().url(),
  sheetId: z.number().int().nonnegative(),
  sheetName: z.string().min(1),
  headerRow: z.number().int().positive().default(1),
  dataStartRow: z.number().int().positive().default(2),
  externalIdColumn: z.string().min(1),
  externalIdFallbackStatus: LocationStatusResult,
  mappings: z.array(GoogleSheetSyncMappingSchema).min(1),
  options: GoogleSheetSyncOptionsSchema.optional().nullable(),
});

export type ConfigureGoogleSheetSyncBody = z.infer<typeof ConfigureGoogleSheetSyncBodySchema>;

export const GoogleSheetPickerConfigSchema = z.object({
  appId: z.string().min(1),
  clientId: z.string().min(1),
  developerKey: z.string().min(1),
  oauthToken: z.string().min(1).optional().nullable(),
  oauthTokenExpiresAt: z.coerce.date().optional().nullable(),
});

export type GoogleSheetPickerConfig = z.infer<typeof GoogleSheetPickerConfigSchema>;

export const GoogleSheetSyncSummaryResponseSchema = z.object({
  sync: GoogleSheetSyncModelSchema.optional().nullable(),
  connected: z.boolean(),
  picker: GoogleSheetPickerConfigSchema,
});

export type GoogleSheetSyncSummaryResponse = z.infer<typeof GoogleSheetSyncSummaryResponseSchema>;

export const ConnectGoogleSheetWithCodeBodySchema = z.object({
  code: z.string().min(1),
});

export type ConnectGoogleSheetWithCodeBody = z.infer<typeof ConnectGoogleSheetWithCodeBodySchema>;

const GoogleSheetPreviewCellValueSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
]);

export const GoogleSheetPreviewRowSchema = z.object({
  rowNumber: z.number().int().positive(),
  values: z.record(z.string(), GoogleSheetPreviewCellValueSchema),
});

export type GoogleSheetPreviewRow = z.infer<typeof GoogleSheetPreviewRowSchema>;

export const GoogleSheetHeadersResponseSchema = z.object({
  spreadsheetId: z.string().min(1),
  sheetId: z.number().int().nonnegative(),
  headerRow: z.number().int().positive(),
  dataStartRow: z.number().int().positive(),
  headers: z.array(z.string()),
  sampleRows: z.array(GoogleSheetPreviewRowSchema).optional().nullable(),
});

export type GoogleSheetHeadersResponse = z.infer<typeof GoogleSheetHeadersResponseSchema>;

export const ConfigureGoogleSheetSyncResponseSchema = z.object({
  queued: z.boolean(),
  sync: GoogleSheetSyncModelSchema,
});

export type ConfigureGoogleSheetSyncResponse = z.infer<typeof ConfigureGoogleSheetSyncResponseSchema>;

const GoogleSheetOperationsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional().nullable(),
  page: z.number().int().positive().default(1),
  syncId: z.string().min(1).optional().nullable(),
  operation: GoogleSheetSyncOperationTypeSchema.optional().nullable(),
});

export type GoogleSheetOperationsQuery = z.infer<typeof GoogleSheetOperationsQuerySchema>;

export const GoogleSheetOperationsResponseSchema = z.object({
  operations: z.array(GoogleSheetSyncOperationModelSchema),
  pagination: z.object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().positive(),
    hasNextPage: z.boolean(),
    hasPreviousPage: z.boolean(),
  }),
});

export type GoogleSheetOperationsResponse = z.infer<typeof GoogleSheetOperationsResponseSchema>;
export type GoogleSheetOperation = GoogleSheetOperationsResponse["operations"][number];
export type GoogleSheetOperationsPagination = GoogleSheetOperationsResponse["pagination"];

export function parseGetGoogleSheetOperationsQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  const queryStringParameters = input.queryStringParameters ?? {};
  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);
  const parsed = GoogleSheetOperationsQuerySchema.safeParse({
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
    syncId: normaliseOptionalQueryString(queryStringParameters.syncId),
    operation: normaliseOptionalQueryString(queryStringParameters.operation),
  });

  if (!parsed.success) {
    throwZodQueryError(parsed.error);
  }

  return parsed.data;
}

export function parseConfigureGoogleSheetSyncBody(body: string | null | undefined) {
  return parseJsonBody(body, ConfigureGoogleSheetSyncBodySchema);
}

export function parseConnectGoogleSheetWithCodeBody(body: string | null | undefined) {
  return parseJsonBody(body, ConnectGoogleSheetWithCodeBodySchema);
}
