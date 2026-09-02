import { useGetWebsiteSettingsQuery } from "@/lib/api";

export function useSiteSettings() {
  const { data, isLoading } = useGetWebsiteSettingsQuery();
  const settings = data?.data;

  const mobile = settings?.mobile ?? "";
  const digits = mobile.replace(/\D/g, "");

  return {
    isLoading,
    name: settings?.name ?? "",
    email: settings?.email ?? "",
    mobile,
    address: settings?.address ?? "",
    whatsapp: digits,
    logoUrl:
      settings?.logo && typeof settings.logo === "object" && "url" in settings.logo
        ? String((settings.logo as { url?: string }).url ?? "")
        : "",
  };
}
