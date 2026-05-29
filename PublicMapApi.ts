import { z } from "zod";

import {
  normaliseOptionalQueryString,
  normaliseQueryStringList,
  throwZodQueryError,
} from "./apiParsing";

const PublicMapBoundsSchema = z.object({
  west: z.number().min(-180).max(180),
  south: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
});

const PublicMapCoordinatesSchema = z.object({
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
});

export const PublicMapCenterAddressSchema = z.object({
  formattedAddress: z.string().nullable(),
  addressLine1: z.string().nullable(),
  addressLine2: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  stateProvince: z.string().nullable(),
  country: z.string().nullable(),
});

export type PublicMapCenterAddress = z.infer<typeof PublicMapCenterAddressSchema>;

export const GetPublicMapQuerySchema = z.object({
  zoom: z.number().nonnegative().max(24),
  search: z.string().max(250).optional().nullable(),
  source: z.enum(["SEARCH", "GEOLOCATION"]).optional().nullable(),
  categories: z.array(z.string().min(1).max(64)).max(10).optional().nullable(),
  bounds: PublicMapBoundsSchema,
  coordinates: PublicMapCoordinatesSchema.optional().nullable(),
});

export type GetPublicMapQuery = z.infer<typeof GetPublicMapQuerySchema>;

export function parseGetPublicMapQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
  multiValueQueryStringParameters?:
    | Record<string, Array<string | null | undefined> | null | undefined>
    | null;
}) {
  const queryStringParameters = input.queryStringParameters ?? {};
  const multiValueQueryStringParameters = input.multiValueQueryStringParameters ?? {};
  const parsed = GetPublicMapQuerySchema.safeParse({
    zoom: Number(normaliseOptionalQueryString(queryStringParameters.zoom)),
    search: normaliseOptionalQueryString(queryStringParameters.search),
    source: normaliseOptionalQueryString(queryStringParameters.source),
    categories: normaliseQueryStringList([
      ...(multiValueQueryStringParameters.categories ?? []),
      queryStringParameters.categories,
    ]),
    bounds: {
      west: Number(normaliseOptionalQueryString(queryStringParameters.west)),
      south: Number(normaliseOptionalQueryString(queryStringParameters.south)),
      east: Number(normaliseOptionalQueryString(queryStringParameters.east)),
      north: Number(normaliseOptionalQueryString(queryStringParameters.north)),
    },
    coordinates:
      normaliseOptionalQueryString(queryStringParameters.lng) === null ||
      normaliseOptionalQueryString(queryStringParameters.lat) === null
        ? null
        : {
            lng: Number(normaliseOptionalQueryString(queryStringParameters.lng)),
            lat: Number(normaliseOptionalQueryString(queryStringParameters.lat)),
          },
  });

  if (!parsed.success) {
    throwZodQueryError(parsed.error);
  }

  return parsed.data;
}
