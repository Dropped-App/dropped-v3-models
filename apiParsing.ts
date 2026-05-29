/* @ts-ignore */
import type { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

const REQUEST_BODY_ERROR = "Request body is not valid";
const QUERY_ERROR = "Query parameters are not valid";
const DEFAULT_MAX_REQUEST_BODY_BYTES = 256 * 1024;

type ParseJsonOptions<T> = {
  allowEmpty?: boolean;
  emptyValue?: T;
  includeIssueMessages?: boolean;
  maxBytes?: number;
};

export function normaliseOptionalQueryString(value: string | null | undefined) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}

export function normaliseQueryStringList(values: Array<string | null | undefined>) {
  const normalised = values
    .flatMap((value) => (value ?? "").split(","))
    .map((value) => value.trim())
    .filter(Boolean);

  return normalised.length ? [...new Set(normalised)] : null;
}

export function parseJsonBody<T>(
  body: string | null | undefined,
  schema: z.ZodType<T>,
  options: ParseJsonOptions<T> = {},
): T {
  if (!body) {
    if (options.allowEmpty && options.emptyValue !== undefined) {
      return options.emptyValue;
    }

    throw new Error(REQUEST_BODY_ERROR);
  }

  return parseJsonString(body, schema, options);
}

export function parseEventJsonBody<T>(event: APIGatewayProxyEvent, schema: z.ZodType<T>): T {
  return parseJsonString(decodeEventBody(event), schema, {
    maxBytes: DEFAULT_MAX_REQUEST_BODY_BYTES,
  });
}

export function throwZodQueryError(error: z.ZodError): never {
  throw new Error(formatZodError(error, QUERY_ERROR));
}

function parseJsonString<T>(
  body: string,
  schema: z.ZodType<T>,
  options: { includeIssueMessages?: boolean; maxBytes?: number } = {},
) {
  assertJsonByteLength(body, options.maxBytes ?? DEFAULT_MAX_REQUEST_BODY_BYTES);

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(body);
  } catch {
    throw new Error(REQUEST_BODY_ERROR);
  }

  const parsed = schema.safeParse(parsedJson);

  if (!parsed.success) {
    if (options.includeIssueMessages === false) {
      throw new Error(REQUEST_BODY_ERROR);
    }

    throw new Error(formatZodError(parsed.error, REQUEST_BODY_ERROR));
  }

  return parsed.data;
}

function decodeEventBody(event: APIGatewayProxyEvent) {
  if (!event.body) {
    throw new Error(REQUEST_BODY_ERROR);
  }

  return event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
}

function assertJsonByteLength(body: string, maxBytes: number) {
  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    throw new Error(REQUEST_BODY_ERROR);
  }
}

function formatZodError(error: z.ZodError, fallback: string) {
  return error.issues.map((issue) => issue.message).join(", ") || fallback;
}
