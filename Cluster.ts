import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import {
  CoordinatesSchema,
  LocationCustomFieldSchema,
  type LocationEntity,
  LocationFilterSchema,
} from "./Location";

const ClusterBoundsSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
});

export type ClusterBounds = z.infer<typeof ClusterBoundsSchema>;

export const PublicLocationMapPayloadSchema = z.object({
  id: z.string(),
  name: z.string().optional().nullable(),
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  stateProvince: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  website: z.string().url().optional().nullable(),
  emailAddress: z.string().email().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
  customFields: z.array(LocationCustomFieldSchema).optional().nullable(),
  filters: z.array(LocationFilterSchema).optional().nullable(),
  priority: z.number().optional().nullable(),
  coordinates: CoordinatesSchema.shape.coordinates,
});

export type PublicLocationMapPayload = z.infer<typeof PublicLocationMapPayloadSchema>;

export const ClusterEntityResult = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema.describe("Organisation that owns this cluster"),
  version: z.string().min(1).describe("Active cluster dataset version for this rebuild batch"),
  zoom: z.number().int().min(0),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  cell: z.string().min(1),
  coordinates: CoordinatesSchema.shape.coordinates,
  count: z.number().int().nonnegative(),
  pointIds: z.array(ObjectIdSchema).max(10),
  sumLng: z.number(),
  sumLat: z.number(),
  bounds: ClusterBoundsSchema,
  singleLocationData: PublicLocationMapPayloadSchema.optional().nullable(),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type ClusterEntity = z.infer<typeof ClusterEntityResult>;

export const ClusterModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  version: ClusterEntityResult.shape.version,
  zoom: ClusterEntityResult.shape.zoom,
  x: ClusterEntityResult.shape.x,
  y: ClusterEntityResult.shape.y,
  cell: ClusterEntityResult.shape.cell,
  coordinates: ClusterEntityResult.shape.coordinates,
  count: ClusterEntityResult.shape.count,
  pointIds: z.array(z.string()),
  sumLng: ClusterEntityResult.shape.sumLng,
  sumLat: ClusterEntityResult.shape.sumLat,
  bounds: ClusterEntityResult.shape.bounds,
  singleLocationData: ClusterEntityResult.shape.singleLocationData,
  createdAt: ClusterEntityResult.shape.createdAt,
  updatedAt: ClusterEntityResult.shape.updatedAt,
});

export type ClusterModel = z.infer<typeof ClusterModelSchema>;

export function buildPublicLocationMapPayload(location: LocationEntity): PublicLocationMapPayload {
  return PublicLocationMapPayloadSchema.parse({
    id: location._id.toHexString(),
    name: location.name ?? null,
    addressLine1: location.addressLine1 ?? null,
    addressLine2: location.addressLine2 ?? null,
    city: location.city ?? null,
    postalCode: location.postalCode ?? null,
    stateProvince: location.stateProvince ?? null,
    country: location.country ?? null,
    phoneNumber: location.phoneNumber ?? null,
    website: location.website ?? null,
    emailAddress: location.emailAddress ?? null,
    logoUrl: location.logoUrl ?? null,
    notes: location.notes ?? null,
    customFields: location.customFields ?? null,
    filters: location.filters ?? null,
    priority: location.priority ?? null,
    coordinates: location.coordinates ?? null,
  });
}

export const ClusterModel = {
  convertFromEntity(entity: ClusterEntity): ClusterModel {
    return ClusterModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      version: entity.version,
      zoom: entity.zoom,
      x: entity.x,
      y: entity.y,
      cell: entity.cell,
      coordinates: entity.coordinates ?? null,
      count: entity.count,
      pointIds: entity.pointIds.map((pointId) => pointId.toHexString()),
      sumLng: entity.sumLng,
      sumLat: entity.sumLat,
      bounds: entity.bounds,
      singleLocationData: entity.singleLocationData ?? null,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    });
  },
};
