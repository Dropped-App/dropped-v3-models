import { z } from "zod";

export const LOCATION_CONTACT_FIELD_LABELS = {
	website: "Website",
	emailAddress: "Email address",
	logoUrl: "Logo URL",
} as const;

export type LocationContactFieldKey = keyof typeof LOCATION_CONTACT_FIELD_LABELS;

const LocationUrlResult = z.string().url().optional().nullable();
const LocationEmailResult = z.string().email().optional().nullable();

function normalizeStringInput(value: unknown) {
	if (typeof value !== "string") {
		return value;
	}

	return normalizeOptionalLocationString(value);
}

export function normalizeOptionalLocationString(value: string | null | undefined) {
	const normalizedValue = value?.trim();
	return normalizedValue ? normalizedValue : null;
}

export const LocationWebsiteResult = LocationUrlResult;
export const LocationEmailAddressResult = LocationEmailResult;
export const LocationLogoUrlResult = LocationUrlResult;

export const LocationWebsiteInputSchema = z.preprocess(normalizeStringInput, LocationUrlResult);
export const LocationEmailAddressInputSchema = z.preprocess(
	normalizeStringInput,
	LocationEmailResult,
);
export const LocationLogoUrlInputSchema = z.preprocess(normalizeStringInput, LocationUrlResult);

export function isValidLocationUrl(value: string | null | undefined) {
	return LocationUrlResult.safeParse(normalizeOptionalLocationString(value)).success;
}

export function isValidLocationEmail(value: string | null | undefined) {
	return LocationEmailResult.safeParse(normalizeOptionalLocationString(value)).success;
}

export function getInvalidLocationContactFields(
	value: Partial<Record<LocationContactFieldKey, string | null | undefined>>,
) {
	return (Object.keys(LOCATION_CONTACT_FIELD_LABELS) as LocationContactFieldKey[]).filter(
		(key) =>
			key === "emailAddress"
				? !isValidLocationEmail(value[key])
				: !isValidLocationUrl(value[key]),
	);
}

export function getLocationContactFieldValidationMessage(key: LocationContactFieldKey) {
	const label = LOCATION_CONTACT_FIELD_LABELS[key];

	return key === "emailAddress"
		? `${label} must be valid when provided.`
		: `${label} must be a valid URL when provided.`;
}
