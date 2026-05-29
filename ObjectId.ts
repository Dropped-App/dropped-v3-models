import { ObjectId } from "bson";
import { z } from "zod";

export type ObjectIdLike = ObjectId | { toHexString(): string };

export function isObjectIdLike(value: unknown): value is ObjectIdLike {
  return (
    value instanceof ObjectId ||
    (typeof value === "object" &&
      value !== null &&
      "toHexString" in value &&
      typeof value.toHexString === "function")
  );
}

export const ObjectIdSchema = z.custom<ObjectId>(isObjectIdLike, {
  message: "Input not instance of t",
});
