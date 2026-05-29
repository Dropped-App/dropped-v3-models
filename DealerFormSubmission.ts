import { ObjectId } from "bson";
import { z } from "zod";

import { ObjectIdSchema } from "./ObjectId";
import { DealerFormFieldTypeSchema } from "./settings/dealerForms";
import {
  MAX_LOCATION_ADDRESS_LINE_LENGTH,
  MAX_LOCATION_CITY_LENGTH,
  MAX_LOCATION_NAME_LENGTH,
  MAX_LOCATION_POSTAL_CODE_LENGTH,
} from "./Location";

const MAX_DEALER_FORM_STORED_TEXT_LENGTH = 2000;
const MAX_DEALER_FORM_CONTACT_NAME_LENGTH = 120;
const MAX_DEALER_FORM_CONTACT_EMAIL_LENGTH = 254;

export const DealerFormAddressValueSchema = z.object({
  addressLine1: z.string().max(MAX_LOCATION_ADDRESS_LINE_LENGTH).optional().nullable(),
  addressLine2: z.string().max(MAX_LOCATION_ADDRESS_LINE_LENGTH).optional().nullable(),
  city: z.string().max(MAX_LOCATION_CITY_LENGTH).optional().nullable(),
  postalCode: z.string().max(MAX_LOCATION_POSTAL_CODE_LENGTH).optional().nullable(),
  stateProvince: z.string().max(MAX_LOCATION_CITY_LENGTH).optional().nullable(),
  country: z.string().max(MAX_LOCATION_CITY_LENGTH).optional().nullable(),
}).strict();

export type DealerFormAddressValue = z.infer<typeof DealerFormAddressValueSchema>;

export const DealerFormContactValueSchema = z.object({
  name: z.string().max(MAX_DEALER_FORM_CONTACT_NAME_LENGTH).optional().nullable(),
  email: z.string().max(MAX_DEALER_FORM_CONTACT_EMAIL_LENGTH).optional().nullable(),
}).strict();

export type DealerFormContactValue = z.infer<typeof DealerFormContactValueSchema>;

export const DealerFormSubmissionStoredValueSchema = z.union([
  z.string().max(MAX_DEALER_FORM_STORED_TEXT_LENGTH),
  z.number(),
  z.boolean(),
  DealerFormAddressValueSchema,
  DealerFormContactValueSchema,
]);

export const DealerFormSubmissionFieldValueSchema = z.object({
  key: z.string().min(1).max(64),
  label: z.string().min(1).max(120),
  type: DealerFormFieldTypeSchema,
  required: z.boolean().optional().nullable(),
  value: DealerFormSubmissionStoredValueSchema.optional().nullable(),
});

export type DealerFormSubmissionFieldValue = z.infer<typeof DealerFormSubmissionFieldValueSchema>;

export const DealerFormSubmissionEntitySchema = z.object({
  _id: ObjectIdSchema,
  org: ObjectIdSchema,
  archived: z.boolean().optional().nullable(),
  publishedLocationId: ObjectIdSchema.optional().nullable(),
  contactName: z.string().max(MAX_DEALER_FORM_CONTACT_NAME_LENGTH).optional().nullable(),
  contactEmail: z.string().max(MAX_DEALER_FORM_CONTACT_EMAIL_LENGTH).optional().nullable(),
  locationName: z.string().max(MAX_LOCATION_NAME_LENGTH).optional().nullable(),
  fields: z.array(DealerFormSubmissionFieldValueSchema),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DealerFormSubmissionEntity = z.infer<typeof DealerFormSubmissionEntitySchema>;

export const DealerFormSubmissionModelSchema = z.object({
  id: z.string(),
  org: z.string(),
  archived: z.boolean().optional().nullable(),
  publishedLocationId: z.string().optional().nullable(),
  contactName: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  fields: z.array(DealerFormSubmissionFieldValueSchema),
  createdAt: z.date().optional().nullable(),
  updatedAt: z.date().optional().nullable(),
});

export type DealerFormSubmissionModel = z.infer<typeof DealerFormSubmissionModelSchema>;

export const DealerFormSubmissionModel = {
  convertFromEntity(entity: DealerFormSubmissionEntity): DealerFormSubmissionModel {
    return DealerFormSubmissionModelSchema.parse({
      id: entity._id.toHexString(),
      org: entity.org.toHexString(),
      archived: entity.archived ?? false,
      publishedLocationId: entity.publishedLocationId?.toHexString() ?? null,
      contactName: entity.contactName ?? null,
      contactEmail: entity.contactEmail ?? null,
      locationName: entity.locationName ?? null,
      fields: entity.fields,
      createdAt: entity.createdAt ? new Date(entity.createdAt) : null,
      updatedAt: entity.updatedAt ? new Date(entity.updatedAt) : null,
    });
  },
};
