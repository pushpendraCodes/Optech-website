import { useGetWebsiteSettingsQuery } from "@/lib/api";

export function useSiteSettings() {
  const { data, isLoading } = useGetWebsiteSettingsQuery();
  const settings = data?.data as
    | {
        name?: string;
        email?: string;
        mobile?: string;
        address?: string;
        logo?: { url?: string } | null;
        adBox1Enabled?: boolean;
        adBox2Enabled?: boolean;
      }
    | undefined;

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
      settings?.logo && typeof settings.logo === "object" && "url" in settings.logo && settings.logo.url
        ? String(settings.logo.url)
        : "/LOGO-new.png",
    adBox1Enabled: settings?.adBox1Enabled !== false,
    adBox2Enabled: settings?.adBox2Enabled !== false,
  };
}
