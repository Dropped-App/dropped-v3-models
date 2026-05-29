import { z } from "zod";

import { normaliseOptionalQueryString, throwZodQueryError } from "./apiParsing";

const MAX_TIME_RANGE_DAYS = 90;
const MAX_TIME_RANGE_MS = MAX_TIME_RANGE_DAYS * 24 * 60 * 60 * 1000;

export const SearchNearestLocationsModeSchema = z
  .union([z.literal("BOTH"), z.literal("EMPTY"), z.literal("HAS_VALUES")])
  .default("BOTH");

export type SearchNearestLocationsMode = z.infer<typeof SearchNearestLocationsModeSchema>;

const GetSearchesBaseQuerySchema = z
  .object({
    from: z.date(),
    to: z.date(),
    nearestLocationsMode: SearchNearestLocationsModeSchema,
  })
  .superRefine((value, ctx) => {
    if (value.to < value.from) {
      ctx.addIssue({
        code: "custom",
        message: "`to` must be greater than or equal to `from`",
        path: ["to"],
      });
    }

    if (value.to.getTime() - value.from.getTime() > MAX_TIME_RANGE_MS) {
      ctx.addIssue({
        code: "custom",
        message: `Time period must be ${MAX_TIME_RANGE_DAYS} days or less`,
        path: ["to"],
      });
    }
  });

export const GetSearchesQuerySchema = GetSearchesBaseQuerySchema.safeExtend({
  limit: z.number().int().positive().max(100).optional().nullable(),
  page: z.number().int().positive().default(1),
});

export type GetSearchesQuery = z.infer<typeof GetSearchesQuerySchema>;

export const GetSearchCoordinatesQuerySchema = GetSearchesBaseQuerySchema;

export type GetSearchCoordinatesQuery = z.infer<typeof GetSearchCoordinatesQuerySchema>;

export const GetLocationSearchCountQuerySchema = GetSearchesBaseQuerySchema;

export type GetLocationSearchCountQuery = z.infer<typeof GetLocationSearchCountQuerySchema>;

function parseQueryDate(value: string | null, fieldName: "from" | "to") {
  if (!value) {
    throw new Error(`\`${fieldName}\` is required`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`\`${fieldName}\` must be a valid date`);
  }

  return date;
}

function parseQuery<T>(
  input: {
    queryStringParameters?: Record<string, string | null | undefined> | null;
  },
  schema: z.ZodType<T>,
): T {
  const queryStringParameters = input.queryStringParameters ?? {};
  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);
  const parsed = schema.safeParse({
    from: parseQueryDate(normaliseOptionalQueryString(queryStringParameters.from), "from"),
    to: parseQueryDate(normaliseOptionalQueryString(queryStringParameters.to), "to"),
    nearestLocationsMode:
      normaliseOptionalQueryString(queryStringParameters.nearestLocationsMode) ?? "BOTH",
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
  });

  if (!parsed.success) {
    throwZodQueryError(parsed.error);
  }

  return parsed.data;
}

export function parseGetSearchesQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  return parseQuery(input, GetSearchesQuerySchema);
}

export function parseGetSearchCoordinatesQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  return parseQuery(input, GetSearchCoordinatesQuerySchema);
}

export function parseGetLocationSearchCountQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  return parseQuery(input, GetLocationSearchCountQuerySchema);
}
