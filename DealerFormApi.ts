import { z } from "zod";

import { DealerFormFieldTypeSchema } from "./settings/dealerForms";
import { normaliseOptionalQueryString, parseJsonBody, throwZodQueryError } from "./apiParsing";

const DEALER_FORM_BODY_MAX_BYTES = 3 * 1024 * 1024;
const NullableString = z.string().optional().nullable();
const DealerFormSubmissionFilterStatusSchema = z
  .enum(["OPEN", "PUBLISHED", "ARCHIVED"])
  .optional()
  .nullable();

export const DealerFormSubmissionInputValueSchema = z.unknown();

export const DealerFormSubmissionInputFieldSchema = z.object({
  key: z.string().min(1).max(64),
  value: DealerFormSubmissionInputValueSchema,
});

export const SubmitDealerFormBodySchema = z.object({
  fields: z.array(DealerFormSubmissionInputFieldSchema).min(1).max(40),
  recaptchaToken: NullableString,
});

export type SubmitDealerFormBody = z.infer<typeof SubmitDealerFormBodySchema>;

export const GetDealerFormSubmissionsQuerySchema = z.object({
  limit: z.number().int().positive().max(100).optional().nullable(),
  page: z.number().int().positive().default(1),
  search: z.string().max(120).optional().nullable(),
  status: DealerFormSubmissionFilterStatusSchema,
});

export type GetDealerFormSubmissionsQuery = z.infer<typeof GetDealerFormSubmissionsQuerySchema>;

export const PublishDealerFormSubmissionBodySchema = z.object({
  id: z.string().min(1),
  status: z.union([z.literal("ACTIVE"), z.literal("UNLISTED")]),
  sendEmail: z.boolean().optional().nullable(),
});

export type PublishDealerFormSubmissionBody = z.infer<typeof PublishDealerFormSubmissionBodySchema>;

export const SetDealerFormSubmissionArchivedBodySchema = z.object({
  id: z.string().min(1),
  archived: z.boolean(),
});

export type SetDealerFormSubmissionArchivedBody = z.infer<
  typeof SetDealerFormSubmissionArchivedBodySchema
>;

export const DealerFormSubmissionFieldResponseSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: DealerFormFieldTypeSchema,
  required: z.boolean().optional().nullable(),
  value: DealerFormSubmissionInputValueSchema.optional().nullable(),
});

export const DeleteDealerFormSubmissionBodySchema = z.object({
  id: z.string().min(1),
});

export type DeleteDealerFormSubmissionBody = z.infer<typeof DeleteDealerFormSubmissionBodySchema>;

function parseBody<T>(body: string | null | undefined, schema: z.ZodType<T>, maxBytes?: number): T {
  return parseJsonBody(body, schema, {
    maxBytes,
  });
}

export function parseSubmitDealerFormBody(body: string | null | undefined) {
  return parseBody(body, SubmitDealerFormBodySchema, DEALER_FORM_BODY_MAX_BYTES);
}

export function parsePublishDealerFormSubmissionBody(body: string | null | undefined) {
  return parseBody(body, PublishDealerFormSubmissionBodySchema);
}

export function parseSetDealerFormSubmissionArchivedBody(body: string | null | undefined) {
  return parseBody(body, SetDealerFormSubmissionArchivedBodySchema);
}

export function parseDeleteDealerFormSubmissionBody(body: string | null | undefined) {
  return parseBody(body, DeleteDealerFormSubmissionBodySchema);
}

export function parseGetDealerFormSubmissionsQuery(input: {
  queryStringParameters?: Record<string, string | null | undefined> | null;
}) {
  const queryStringParameters = input.queryStringParameters ?? {};
  const limitValue = normaliseOptionalQueryString(queryStringParameters.limit);
  const pageValue = normaliseOptionalQueryString(queryStringParameters.page);

  const parsed = GetDealerFormSubmissionsQuerySchema.safeParse({
    limit: limitValue === null ? null : Number(limitValue),
    page: pageValue === null ? 1 : Number(pageValue),
    search: normaliseOptionalQueryString(queryStringParameters.search),
    status: normaliseOptionalQueryString(queryStringParameters.status),
  });

  if (!parsed.success) {
    throwZodQueryError(parsed.error);
  }

  return parsed.data;
}
