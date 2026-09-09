import type { MetadataRoute } from "next";
import { fetchPublicCourses } from "@/lib/public-api";
import { PUBLIC_PATHS, absUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_PATHS.map((item) => ({
    url: absUrl(item.path),
    lastModified: now,
    changeFrequency: item.changeFrequency,
    priority: item.priority,
  }));

  const courses = await fetchPublicCourses();
  const courseEntries: MetadataRoute.Sitemap = courses
    .map((course) => String(course.slug ?? "").trim())
    .filter(Boolean)
    .map((slug) => ({
      url: absUrl(`/courses/${slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  return [...staticEntries, ...courseEntries];
}
