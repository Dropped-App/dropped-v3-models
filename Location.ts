import { ObjectId } from "bson";
import { z } from "zod";
import { ObjectIdSchema } from "./ObjectId";
import {
  LocationEmailAddressResult,
  LocationLogoUrlResult,
  LocationWebsiteResult,
} from "./LocationContactFields";

export const MAX_LOCATION_NAME_LENGTH = 120;
export const MAX_LOCATION_ADDRESS_LINE_LENGTH = 250;
export const MAX_LOCATION_CITY_LENGTH = 120;
export const MAX_LOCATION_POSTAL_CODE_LENGTH = 40;
export const MAX_LOCATION_PHONE_NUMBER_LENGTH = 40;
export const MAX_LOCATION_NOTES_LENGTH = 2000;
export const MAX_LOCATION_CUSTOM_FIELD_KEY_LENGTH = 64;
export const MAX_LOCATION_CUSTOM_FIELD_LABEL_LENGTH = 120;
export const MAX_LOCATION_CUSTOM_FIELD_VALUE_LENGTH = 1000;
export const MAX_LOCATION_FILTER_KEY_LENGTH = 64;
export const MAX_LOCATION_FILTER_VALUE_LENGTH = 64;
export const MAX_LOCATION_CUSTOM_FIELDS = 25;
export const MAX_LOCATION_FILTERS = 25;

export const LocationNameSchema = z.string().max(MAX_LOCATION_NAME_LENGTH).optional().nullable();
export const LocationAddressLineSchema = z
  .string()
  .max(MAX_LOCATION_ADDRESS_LINE_LENGTH)
  .optional()
  .nullable();
export const LocationCitySchema = z.string().max(MAX_LOCATION_CITY_LENGTH).optional().nullable();
export const LocationPostalCodeSchema = z
  .string()
  .max(MAX_LOCATION_POSTAL_CODE_LENGTH)
  .optional()
  .nullable();
export const LocationPhoneNumberSchema = z
  .string()
  .max(MAX_LOCATION_PHONE_NUMBER_LENGTH)
  .optional()
  .nullable();
export const LocationNotesSchema = z.string().max(MAX_LOCATION_NOTES_LENGTH).optional().nullable();

export const LocationStatusResult = z
  .union([
    z.literal("ACTIVE"),
    z.literal("UNLISTED"),
    z.literal("INACTIVE"),
  ])
  .optional()
  .nullable();

export type LocationStatus = z.infer<typeof LocationStatusResult>;

export const LocationCustomFieldTypeResult = z
  .union([
    z.literal("TEXT"),
    z.literal("TEXT_MULTILINE"),
    z.literal("LINK"),
  ])
  .optional()
  .nullable();

export type LocationCustomFieldType = z.infer<typeof LocationCustomFieldTypeResult>;

export const LocationCustomFieldSchema = z
  .object({
    key: z.string().max(MAX_LOCATION_CUSTOM_FIELD_KEY_LENGTH).optional().nullable(),
    label: z.string().max(MAX_LOCATION_CUSTOM_FIELD_LABEL_LENGTH).optional().nullable(),
    type: LocationCustomFieldTypeResult.describe("Display/input type for this custom field"),
    value: z.string().max(MAX_LOCATION_CUSTOM_FIELD_VALUE_LENGTH).optional().nullable(),
    showOnListing: z.boolean().optional().nullable().describe("Whether this field is visible in storefront location listings"),
  })
  .superRefine((value, ctx) => {
    if (value.value === null || value.value === undefined || !value.type) {
      return;
    }

    if (typeof value.value !== "string") {
      ctx.addIssue({
        code: "custom",
        message: "Custom field value must be a string",
        path: ["value"],
      });
    }

    if (value.type === "LINK" && typeof value.value === "string") {
      const parsed = z.string().url().safeParse(value.value);

      if (!parsed.success) {
        ctx.addIssue({
          code: "custom",
          message: "Custom field value must be a valid URL",
          path: ["value"],
        });
      }
    }
  });

export type LocationCustomField = z.infer<typeof LocationCustomFieldSchema>;

export const LocationFilterSchema = z.object({
  key: z.string().max(MAX_LOCATION_FILTER_KEY_LENGTH).optional().nullable(),
  value: z.string().max(MAX_LOCATION_FILTER_VALUE_LENGTH).optional().nullable(),
});

export type LocationFilter = z.infer<typeof LocationFilterSchema>;

type LegacyCoordinates = {
  coordinates?: [number, number] | null;
  lat?: number | null;
  lng?: number | null;
};

function validateCoordinates(
  value: {
    coordinates?: [number, number] | null;
  },
  ctx: z.RefinementCtx,
) {
  if (value.coordinates !== undefined && value.coordinates !== null && value.coordinates.length !== 2) {
    ctx.addIssue({
      code: "custom",
      message: "coordinates must contain longitude and latitude",
      path: ["coordinates"],
    });
  }
}

export const CoordinatesSchema = z
  .object({
    coordinates: z
      .tuple([
        z.number().min(-180).max(180),
        z.number().min(-90).max(90),
      ])
      .optional()
      .nullable()
      .describe("Coordinates pair in [longitude, latitude] order"),
  })
  .superRefine(validateCoordinates);

export const LocationEntityResult = z
  .object({
    _id: ObjectIdSchema,
    org: ObjectIdSchema.describe("Organisation that owns this location"),
    status: LocationStatusResult.describe("Location visibility and publication state"),
    name: LocationNameSchema,
    addressLine1: LocationAddressLineSchema,
    addressLine2: LocationAddressLineSchema,
    city: LocationCitySchema,
    postalCode: LocationPostalCodeSchema,
    stateProvince: LocationCitySchema,
    country: LocationCitySchema,
    phoneNumber: LocationPhoneNumberSchema,
    website: LocationWebsiteResult,
    emailAddress: LocationEmailAddressResult,
    logoUrl: LocationLogoUrlResult,
    notes: LocationNotesSchema,
    customFields: z.array(LocationCustomFieldSchema).max(MAX_LOCATION_CUSTOM_FIELDS).optional().nullable(),
    filters: z.array(LocationFilterSchema).max(MAX_LOCATION_FILTERS).optional().nullable(),
    priority: z.number().optional().nullable(),
    suppressWarnings: z.boolean().optional().nullable(),
    coordinates: CoordinatesSchema.shape.coordinates,
    createdAt: z.date().optional().nullable(),
    updatedAt: z.date().optional().nullable(),
  })
  .superRefine(validateCoordinates);

export type LocationEntity = z.infer<typeof LocationEntityResult>;

export const LocationModelSchema = z
  .object({
    id: z.string(),
    org: z.string(),
    status: LocationEntityResult.shape.status,
    name: LocationEntityResult.shape.name,
    addressLine1: LocationEntityResult.shape.addressLine1,
    addressLine2: LocationEntityResult.shape.addressLine2,
    city: LocationEntityResult.shape.city,
    postalCode: LocationEntityResult.shape.postalCode,
    stateProvince: LocationEntityResult.shape.stateProvince,
    country: LocationEntityResult.shape.country,
    phoneNumber: LocationEntityResult.shape.phoneNumber,
    website: LocationEntityResult.shape.website,
    emailAddress: LocationEntityResult.shape.emailAddress,
    logoUrl: LocationEntityResult.shape.logoUrl,
    notes: LocationEntityResult.shape.notes,
    customFields: LocationEntityResult.shape.customFields,
    filters: LocationEntityResult.shape.filters,
    priority: LocationEntityResult.shape.priority,
    suppressWarnings: LocationEntityResult.shape.suppressWarnings,
    coordinates: LocationEntityResult.shape.coordinates,
    createdAt: LocationEntityResult.shape.createdAt,
    updatedAt: LocationEntityResult.shape.updatedAt,
  })
  .superRefine(validateCoordinates);

export type LocationModel = z.infer<typeof LocationModelSchema>;

export function getLocationCoordinates(value: LegacyCoordinates) {
  if (value.coordinates !== undefined) {
    return value.coordinates ?? null;
  }

  const hasLat = value.lat !== null && value.lat !== undefined;
  const hasLng = value.lng !== null && value.lng !== undefined;

  if (hasLat && hasLng) {
    return [value.lng as number, value.lat as number] as [number, number];
  }

  return null;
}

export const LocationModel = {
  convertFromEntity(entity: LocationEntity & LegacyCoordinates): LocationModel {
    const obj: LocationModel = {
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      status: entity.status ?? null,
      name: entity.name ?? null,
      addressLine1: entity.addressLine1 ?? null,
      addressLine2: entity.addressLine2 ?? null,
      city: entity.city ?? null,
      postalCode: entity.postalCode ?? null,
      stateProvince: entity.stateProvince ?? null,
      country: entity.country ?? null,
      phoneNumber: entity.phoneNumber ?? null,
      website: entity.website ?? null,
      emailAddress: entity.emailAddress ?? null,
      logoUrl: entity.logoUrl ?? null,
      notes: entity.notes ?? null,
      customFields: entity.customFields ?? null,
      filters: entity.filters ?? null,
      priority: entity.priority ?? null,
      suppressWarnings: entity.suppressWarnings ?? null,
      coordinates: getLocationCoordinates(entity),
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    };

    return LocationModelSchema.parse(obj);
  },
};
