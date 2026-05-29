/* @ts-ignore */
import type { APIGatewayProxyEvent } from "aws-lambda";
import { z } from "zod";

import { parseEventJsonBody } from "./apiParsing";

const NullableStringField = z.string().max(500).optional().nullable();

export const SaveLogsBodySchema = z.object({
  logs: z.array(z.unknown()).max(50),
  message: NullableStringField,
  user_agent: NullableStringField,
  page: z.string().max(2000).optional().nullable(),
});

export type SaveLogsBody = z.infer<typeof SaveLogsBodySchema>;

export function parseSaveLogsBody(event: APIGatewayProxyEvent): SaveLogsBody {
  return parseEventJsonBody(event, SaveLogsBodySchema);
}
