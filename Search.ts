import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { CoordinatesSchema, LocationEntityResult } from "./Location";

export const SearchEntityResult = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema.describe("Organisation that owns this search record"),
  coordinates: CoordinatesSchema.shape.coordinates,
  formattedAddress: z.string().optional().nullable(),
  addressLine1: LocationEntityResult.shape.addressLine1,
  addressLine2: LocationEntityResult.shape.addressLine2,
  city: LocationEntityResult.shape.city,
  postalCode: LocationEntityResult.shape.postalCode,
  stateProvince: LocationEntityResult.shape.stateProvince,
  country: LocationEntityResult.shape.country,
  nearestLocations: z
    .array(ObjectIdSchema)
    .max(10)
    .optional()
    .nullable()
    .describe("Nearest matching locations for this search, limited to ten ids"),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type SearchEntity = z.infer<typeof SearchEntityResult>;

export const SearchModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  coordinates: SearchEntityResult.shape.coordinates,
  formattedAddress: SearchEntityResult.shape.formattedAddress,
  addressLine1: SearchEntityResult.shape.addressLine1,
  addressLine2: SearchEntityResult.shape.addressLine2,
  city: SearchEntityResult.shape.city,
  postalCode: SearchEntityResult.shape.postalCode,
  stateProvince: SearchEntityResult.shape.stateProvince,
  country: SearchEntityResult.shape.country,
  nearestLocations: z.array(z.string()).max(10).optional().nullable(),
  createdAt: SearchEntityResult.shape.createdAt,
  updatedAt: SearchEntityResult.shape.updatedAt,
});

export type SearchModel = z.infer<typeof SearchModelSchema>;

export const SearchModel = {
  convertFromEntity(entity: SearchEntity): SearchModel {
    return SearchModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      coordinates: entity.coordinates ?? null,
      formattedAddress: entity.formattedAddress ?? null,
      addressLine1: entity.addressLine1 ?? null,
      addressLine2: entity.addressLine2 ?? null,
      city: entity.city ?? null,
      postalCode: entity.postalCode ?? null,
      stateProvince: entity.stateProvince ?? null,
      country: entity.country ?? null,
      nearestLocations: entity.nearestLocations?.map((locationId) => locationId.toHexString()) ?? null,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    });
  },
};
