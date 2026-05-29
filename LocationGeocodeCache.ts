import { z } from "zod";

export const LocationGeocodeCacheCollection = "locationGeocodeCache";

export const NominatimAddressSchema = z.object({
  addressLine1: z.string().optional().nullable(),
  addressLine2: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  postcode: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  county: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  building: z.string().optional().nullable(),
  shop: z.string().optional().nullable(),
  houseName: z.string().optional().nullable(),
});

export type NominatimAddress = z.infer<typeof NominatimAddressSchema>;

export const NominatimResultSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  address: NominatimAddressSchema,
  displayName: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
});

export type NominatimResult = z.infer<typeof NominatimResultSchema>;

export const LocationGeocodeCacheEntitySchema = z.object({
  _id: z.string(),
  query: z.string(),
  results: z.array(NominatimResultSchema),
  result: NominatimResultSchema.nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LocationGeocodeCacheEntity = z.infer<typeof LocationGeocodeCacheEntitySchema>;
