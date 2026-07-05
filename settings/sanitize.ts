import {
  PRODUCT_SHARING_SYNC_FIELDS,
  type ProductSharingSyncField,
} from "../ProductSharingSyncField";
import { type Settings } from "../OrganisationSettings";

const PRODUCT_SHARING_SYNC_FIELD_SET = new Set<string>(PRODUCT_SHARING_SYNC_FIELDS);

export function sanitizeProductSharingSyncFieldList(
  input: unknown,
): ProductSharingSyncField[] | null | undefined {
  if (input === null || input === undefined) {
    return input;
  }

  if (!Array.isArray(input)) {
    return undefined;
  }

  const sanitizedFields = input.filter(
    (field): field is ProductSharingSyncField =>
      typeof field === "string" && PRODUCT_SHARING_SYNC_FIELD_SET.has(field),
  );

  return [...new Set(sanitizedFields)];
}

export function sanitizeSettingsGroups(input: Settings): Settings {
  if (!input?.productSharing?.senderDefaults && !input?.productSharing?.receiverDefaults) {
    return input;
  }

  return {
    ...input,
    productSharing: {
      ...input.productSharing,
      senderDefaults: input.productSharing.senderDefaults
        ? {
            ...input.productSharing.senderDefaults,
            defaultSelectedFields: sanitizeProductSharingSyncFieldList(
              input.productSharing.senderDefaults.defaultSelectedFields,
            ),
          }
        : input.productSharing.senderDefaults,
      receiverDefaults: input.productSharing.receiverDefaults
        ? {
            ...input.productSharing.receiverDefaults,
            defaultImportSelectedFields: sanitizeProductSharingSyncFieldList(
              input.productSharing.receiverDefaults.defaultImportSelectedFields,
            ),
            defaultUpdateSelectedFields: sanitizeProductSharingSyncFieldList(
              input.productSharing.receiverDefaults.defaultUpdateSelectedFields,
            ),
          }
        : input.productSharing.receiverDefaults,
    },
  };
}
