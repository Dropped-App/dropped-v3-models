import { z } from "zod";

import type { CustomFieldType } from "./customFields";
import {
  createSettingsConverter,
  NullableBoolean,
  NullableKeyString,
  NullableLabelString,
  NullableLongTextString,
  NullablePlaceholderString,
  NullableString,
} from "./shared";

export const DealerFormFieldTypeSchema = z
  .enum([
    "TEXT",
    "TEXT_MULTILINE",
    "SELECT",
    "CONTACT",
    "EMAIL",
    "PHONE",
    "ADDRESS",
    "CHECKBOX",
    "FILE_UPLOAD",
    "IMAGE_UPLOAD",
    "NUMBER",
    "LINK",
  ])
  .optional()
  .nullable()
  .describe("Input type used for dealer form field values.");

export type DealerFormFieldType = z.infer<typeof DealerFormFieldTypeSchema>;

export const DealerFormRecaptchaVersionSchema = z
  .enum(["V2", "V3"])
  .optional()
  .nullable()
  .describe("Configured reCAPTCHA version for dealer form submissions.");

export type DealerFormRecaptchaVersion = z.infer<typeof DealerFormRecaptchaVersionSchema>;

export const DealerFormFieldOptionSchema = z.object({
  label: NullableLabelString.describe("Display label shown to dealer for this option."),
  value: NullableString.describe("Stable value stored for this option."),
});

export type DealerFormFieldOption = z.infer<typeof DealerFormFieldOptionSchema>;

export const DealerFormFieldDefinitionSchema = z.object({
  key: NullableKeyString.describe("Stable identifier for this dealer form field."),
  label: NullableLabelString.describe("Field label shown in app settings and storefront form."),
  placeholder: NullablePlaceholderString.describe(
    "Optional placeholder shown inside the storefront input for this dealer form field.",
  ),
  type: DealerFormFieldTypeSchema,
  required: NullableBoolean.describe("Whether dealer must provide value before submission."),
  locked: NullableBoolean.describe(
    "Whether this field is a core system field and should not be deletable in admin UI.",
  ),
  options: z
    .array(DealerFormFieldOptionSchema)
    .max(50)
    .optional()
    .nullable()
    .describe("Selectable options for select fields."),
});

export type DealerFormFieldDefinition = z.infer<typeof DealerFormFieldDefinitionSchema>;

export const DEFAULT_DEALER_FORM_FIELDS: DealerFormFieldDefinition[] = [
  {
    key: "contact",
    label: "Contact Details",
    placeholder: "Enter contact name",
    type: "CONTACT",
    required: true,
    locked: true,
    options: [],
  },
  {
    key: "name",
    label: "Store name",
    placeholder: "Enter store name",
    type: "TEXT",
    required: true,
    locked: true,
    options: [],
  },
  {
    key: "address",
    label: "Address",
    placeholder: "Search address",
    type: "ADDRESS",
    required: true,
    locked: true,
    options: [],
  },
  {
    key: "phoneNumber",
    label: "Store phone",
    placeholder: "Enter store phone",
    type: "PHONE",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "website",
    label: "Website",
    placeholder: "Enter website",
    type: "LINK",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "emailAddress",
    label: "Store email",
    placeholder: "Enter store email",
    type: "EMAIL",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "logoUrl",
    label: "Logo URL",
    placeholder: "Enter logo URL",
    type: "IMAGE_UPLOAD",
    required: false,
    locked: false,
    options: [],
  },
  {
    key: "message",
    label: "Message",
    placeholder: "Enter message",
    type: "TEXT_MULTILINE",
    required: false,
    locked: false,
    options: [],
  },
];

export const DEFAULT_DEALER_FORM_FIELD_KEYS = DEFAULT_DEALER_FORM_FIELDS.map(
  (field) => field.key || "",
).filter(Boolean);

export function mapDealerFieldTypeToCustomFieldType(
  type?: DealerFormFieldType | null,
): CustomFieldType {
  switch (type) {
    case "LINK":
    case "FILE_UPLOAD":
    case "IMAGE_UPLOAD":
      return "LINK";
    case "TEXT_MULTILINE":
    case "ADDRESS":
    case "CONTACT":
      return "TEXT_MULTILINE";
    case "TEXT":
    case "SELECT":
    case "EMAIL":
    case "PHONE":
    case "CHECKBOX":
    case "NUMBER":
    default:
      return "TEXT";
  }
}

export const DealerFormsSettingsSchema = z.object({
  fields: z
    .array(DealerFormFieldDefinitionSchema)
    .max(30)
    .optional()
    .nullable()
    .describe("Administrator-managed dealer form field definitions."),
  notificationEnabled: NullableBoolean.describe(
    "Whether organisation should receive admin email notifications for new dealer submissions.",
  ),
  notificationEmail: NullableString.describe(
    "Email address that receives new dealer submission notifications. Defaults to organisation contact email when empty.",
  ),
  dealerNotificationEnabled: NullableBoolean.describe(
    "Whether dealer should receive a confirmation email after submitting the dealer form.",
  ),
  notificationAccentColor: NullableString.describe(
    "Accent color used for dealer form notification emails sent to dealer and organisation.",
  ),
  dealerNotificationSubject: NullableString.describe(
    "Subject template for dealer confirmation emails. Supports {name} placeholder.",
  ),
  dealerNotificationBody: NullableLongTextString.describe(
    "Body template for dealer confirmation emails. Supports {name} placeholder.",
  ),
  dealerPublishedSubject: NullableString.describe(
    "Subject template for dealer published emails. Supports {name} placeholder.",
  ),
  dealerPublishedBody: NullableLongTextString.describe(
    "Body template for dealer published emails. Supports {name} placeholder.",
  ),
  recaptchaSiteKey: NullableString.describe("reCAPTCHA site key for dealer form submissions."),
  recaptchaSecretKey: NullableString.describe(
    "reCAPTCHA secret key for dealer form submissions.",
  ),
  recaptchaVersion: DealerFormRecaptchaVersionSchema,
});

export type DealerFormsSettings = z.infer<typeof DealerFormsSettingsSchema>;

export const DealerFormsSettingsConverter = createSettingsConverter(DealerFormsSettingsSchema);
