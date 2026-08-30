import type { Localized } from "./api-types";

export function loc(value: Localized | string | undefined | null) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || value.hi || value.mr || "";
}
