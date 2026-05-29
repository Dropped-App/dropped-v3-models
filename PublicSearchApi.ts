/* @ts-ignore */
import type { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

import { CoordinatesSchema } from "./Location";
import { parseEventJsonBody } from "./apiParsing";

const NullableAddressField = z.string().max(250).optional().nullable();

export const SaveSearchBodySchema = z.object({
  formattedAddress: z.string().max(500).optional().nullable(),
  addressLine1: NullableAddressField,
  addressLine2: NullableAddressField,
  city: z.string().max(120).optional().nullable(),
  postalCode: z.string().max(40).optional().nullable(),
  stateProvince: z.string().max(120).optional().nullable(),
  country: z.string().max(120).optional().nullable(),
  coordinates: CoordinatesSchema.shape.coordinates,
  nearestLocations: z.array(z.string().min(1)).max(10).optional().nullable(),
});

export type SaveSearchBody = z.infer<typeof SaveSearchBodySchema>;

export function parseSaveSearchBody(event: APIGatewayProxyEvent): SaveSearchBody {
  return parseEventJsonBody(event, SaveSearchBodySchema);
}
