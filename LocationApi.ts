import { z } from "zod";

import {
  CoordinatesSchema,
  LocationAddressLineSchema,
  LocationCitySchema,
  LocationCustomFieldSchema,
  LocationFilterSchema,
  LocationNameSchema,
  LocationNotesSchema,
  LocationPhoneNumberSchema,
  LocationPostalCodeSchema,
  MAX_LOCATION_CUSTOM_FIELDS,
  MAX_LOCATION_FILTERS,
  MAX_LOCATION_NAME_LENGTH,
  LocationStatusResult,
} from "./Location";
import {
  LocationEmailAddressInputSchema,
  LocationLogoUrlInputSchema,
  LocationWebsiteInputSchema,
} from "./LocationContactFields";
import {
  normaliseOptionalQueryString,
  normaliseQueryStringList,
  parseJsonBody,
  throwZodQueryError,
} from "./apiParsing";

const BULK_LOCATION_BODY_MAX_BYTES = 5 * 1024 * 1024;
const NullableNumberInput = z.number().optional().nullable();

export const CreateLocationBodySchema = z.object({
  status: LocationStatusResult,
  name: z.string().min(1).max(MAX_LOCATION_NAME_LENGTH),
  addressLine1: LocationAddressLineSchema,
  addressLine2: LocationAddressLineSchema,
  city: LocationCitySchema,
  postalCode: LocationPostalCodeSchema,
  stateProvince: LocationCitySchema,
  country: LocationCitySchema,
  phoneNumber: LocationPhoneNumberSchema,
  website: LocationWebsiteInputSchema,
  emailAddress: LocationEmailAddressInputSchema,
  logoUrl: LocationLogoUrlInputSchema,
  notes: LocationNotesSchema,
  customFields: z.array(LocationCustomFieldSchema).max(MAX_LOCATION_CUSTOM_FIELDS).optional().nullable(),
  filters: z.array(LocationFilterSchema).max(MAX_LOCATION_FILTERS).optional().nullable(),
  priority: NullableNumberInput,
  suppressWarnings: z.boolean().optional().nullable(),
  coordinates: CoordinatesSchema.shape.coordinates,
});

export type CreateLocationBody = z.infer<typeof CreateLocationBodySchema>;

export const UpdateLocationBodySchema = z
  .object({
    id: z.string().min(1),
    status: LocationStatusResult,
    name: LocationNameSchema,
    addressLine1: LocationAddressLineSchema,
    addressLine2: LocationAddressLineSchema,
    city: LocationCitySchema,
    postalCode: LocationPostalCodeSchema,
    stateProvince: LocationCitySchema,
    country: LocationCitySchema,
    phoneNumber: LocationPhoneNumberSchema,
    website: LocationWebsiteInputSchema,
    emailAddress: LocationEmailAddressInputSchema,
    logoUrl: LocationLogoUrlInputSchema,
    notes: LocationNotesSchema,
    customFields: z.array(LocationCustomFieldSchema).max(MAX_LOCATION_CUSTOM_FIELDS).optional().nullable(),
    filters: z.array(LocationFilterSchema).max(MAX_LOCATION_FILTERS).optional().nullable(),
    priority: NullableNumberInput,
    suppressWarnings: z.boolean().optional().nullable(),
    coordinates: CoordinatesSchema.shape.coordinates,
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 1) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided for update",
        path: ["id"],
      });
    }
  });

export type UpdateLocationBody = z.infer<typeof UpdateLocationBodySchema>;

export const ImportLocationBodySchema = CreateLocationBodySchema.safeExtend({
  id: z.string().min(1).optional().nullable(),
  formattedAddress: z.string().max(500).optional().nullable(),
});

export type ImportLocationBody = z.infer<typeof ImportLocationBodySchema>;

export const ImportLocationsBulkOptionsSchema = z.object({
  matchExistingByAddressOrCoordinates: z.boolean().optional().nullable(),
  resolveCoordinatesFromAddress: z.boolean().optional().nullable(),
  parseFormattedAddress: z.boolean().optional().nullable(),
});

export type ImportLocationsBulkOptions = z.infer<typeof ImportLocationsBulkOptionsSchema>;

export const ImportLocationsBulkBodySchema = z.object({
  locations: z.array(ImportLocationBodySchema).min(1),
  options: ImportLocationsBulkOptionsSchema.optional().nullable(),
});

export type ImportLocationsBulkBody = z.infer<typeof ImportLocationsBulkBodySchema>;

export const ImportLocationsBulkSkippedSchema = z.object({
  row: z.number().int().positive(),
  reason: z.string().min(1),
});

export type ImportLocationsBulkSkipped = z.infer<typeof ImportLocationsBulkSkippedSchema>;

export const ImportLocationsBulkResponseSchema = z.object({
  job: z.object({
    id: z.string().min(1),
    org: z.string().min(1),
    status: z.union([
      z.literal("PENDING"),
      z.literal("PROCESSING"),
      z.literal("COMPLETED"),
      z.literal("FAILED"),
    ]),
    totalRows: z.number().int().positive(),
    queuedCount: z.number().int().nonnegative(),
    createdCount: z.number().int().nonnegative(),
    updatedCount: z.number().int().nonnegative(),
    skipped: z.array(ImportLocationsBulkSkippedSchema),
  }),
});

export type ImportLocationsBulkResponse = z.infer<typeof ImportLocationsBulkResponseSchema>;

export const BulkUpdateLocationsBodySchema = z.object({
  locations: z.array(UpdateLocationBodySchema).min(1),
});

export type BulkUpdateLocationsBody = z.infer<typeof BulkUpdateLocationsBodySchema>;

export const BulkDeleteLocationsBodySchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(200),
});

export type BulkDeleteLocationsBody = z.infer<typeof BulkDeleteLocationsBodySchema>;

export const QueueLocationGeocodeBodySchema = z.object({
  locationIds: z.array(z.string().min(1)).min(1).max(1000),
});

export type QueueLocationGeocodeBody = z.infer<typeof QueueLocationGeocodeBodySchema>;

export const SuppressLocationWarningsBodySchema = z.object({
  locationIds: z.array(z.string().min(1)).min(1).max(1000),
});

export type SuppressLocationWarningsBody = z.infer<typeof SuppressLocationWarningsBodySchema>;

export const DuplicateLocationAuditSchema = z.object({
  recommendedKeep: z.string().min(1),
  recommendedDelete: z.string().min(1),
  oldestLocation: z.string().min(1),
  newestLocation: z.string().min(1),
});

export const LocationMaintenanceAuditResponseSchema = z.object({
  missingAddressParts: z.array(z.string().min(1)),
  missingCoordinates: z.array(z.string().min(1)),
  duplicateLocations: z.array(DuplicateLocationAuditSchema),
});

export type LocationMaintenanceAuditResponse = z.infer<typeof LocationMaintenanceAuditResponseSchema>;

export const LocationGeocodeJobsSummaryResponseSchema = z.object({
  processing: z.number().int().nonnegative(),
  failed: z.number().int().nonnegative(),
});

export type LocationGeocodeJobsSummaryResponse = z.infer<typeof LocationGeocodeJobsSummaryResponseSchema>;

export const LocationUsageResponseSchema = z.object({
  plan: z.object({
    id: z.string(),
    name: z.string(),
  }),
  limit: z.number().int().nonnegative(),
  usage: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});

export type LocationUsageResponse = z.infer<typeof LocationUsageResponseSchema>;

const LocationImportJobStatusQuerySchema = z.union([
  z.literal("PENDING"),
  z.literal("PROCESSING"),
  z.literal("COMPLETED"),
  z.literal("FAILED"),
]);

const GetLocationImportJobsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional().nullable(),
  page: z.number().int().positive().default(1),
  status: LocationImportJobStatusQuerySchema.optional().nullable(),
});

export type GetLocationImportJobsQuery = z.infer<typeof GetLocationImportJobsQuerySchema>;

const GetLocationsQuerySchema = z.object({
  limit: z.number().int().positive().max(1000).optional().nullable(),
  page: z.number().int().positive().default(1),
  ids: z.array(z.string().min(1)).optional().nullable(),
  search: z.string().max(250).optional().nullable(),
  status: LocationStatusResult,
  categories: z.array(z.string().min(1).max(64)).max(50).optional().nullable(),
});

export type GetLocationsQuery = z.infer<typeof GetLocationsQuerySchema>;

function parseBody<T>(
  body: string | null | undefined,
  schema: z.ZodType<T>,
  maxBytes?: number,
): T {
  return parseJsonBody(body, schema, {
    maxBytes,
  });
}

export function parseCreateLocationBody(body: string | null | undefined): CreateLocationBody {
  return parseBody(body, CreateLocationBodySchema);
}

export function parseUpdateLocationBody(body: string | null | undefined): UpdateLocationBody {
  return parseBody(body, UpdateLocationBodySchema);
}

export function parseImportLocationsBulkBody(
  body: string | null | undefined,
): ImportLocationsBulkBody {
  return parseBody(body, ImportLocationsBulkBodySchema, BULK_LOCATION_BODY_MAX_BYTES);
}

export function parseBulkUpdateLocationsBody(
  body: string | null | undefined,
): BulkUpdateLocationsBody {
  return parseBody(body, BulkUpdateLocationsBodySchema, BULK_LOCATION_BODY_MAX_BYTES);
}

export function parseBulkDeleteLocationsBody(
  body: string | null | undefined,
): BulkDeleteLocationsBody {
  return parseBody(body, BulkDeleteLocationsBodySchema);
}

export function parseQueueLocationGeocodeBody(
  body: string | null | undefined,
): QueueLocationGeocodeBody {
  return parseBody(body, QueueLocationGeocodeBodySchema);
}

export function parseSuppressLocationWarningsBody(
  body: string | null | undefined,
): SuppressLocationWarningsBody {
  return parseBody(body, SuppressLocationWarningsBodySchema);
}


export function parseGetLocationsQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
  multiValueQueryStringParameters?:
    | Record<string, Array<string | null | undefined> | null | undefined>
    | null;
}): GetLocationsQuery {
  const queryStringParameters = input.queryStringParameters ?? {};
  const multiValueQueryStringParameters = input.multiValueQueryStringParameters ?? {};

  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);

  const parsed = GetLocationsQuerySchema.safeParse({
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
    ids: normaliseQueryStringList([
      ...(multiValueQueryStringParameters.ids ?? []),
      queryStringParameters.ids,
    ]),
    search: normaliseOptionalQueryString(queryStringParameters.search),
    status: normaliseOptionalQueryString(queryStringParameters.status),
    categories: normaliseQueryStringList([
      ...(multiValueQueryStringParameters.categories ?? []),
      queryStringParameters.categories,
    ]),
  });

  if (!parsed.success) {
    throwZodQueryError(parsed.error);
  }

  return parsed.data;
}

export function parseGetLocationImportJobsQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  const queryStringParameters = input.queryStringParameters ?? {};
  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);
  const parsed = GetLocationImportJobsQuerySchema.safeParse({
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
    status: normaliseOptionalQueryString(queryStringParameters.status),
  });

  if (!parsed.success) {
    throwZodQueryError(parsed.error);
  }

  return parsed.data;
}
