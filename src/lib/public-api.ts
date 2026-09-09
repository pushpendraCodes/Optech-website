import { siteUrl } from "./seo";
import type { ApiSuccess, PublicCourse } from "./api-types";

function apiRoot() {
  const internal = process.env.API_PROXY_TARGET || process.env.API_INTERNAL_URL;
  if (internal) return `${internal.replace(/\/$/, "")}/api/v1`;
  return `${siteUrl}/api/v1`;
}

export async function fetchPublicData<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${apiRoot()}${path}`, {
      next: { revalidate: 3600 },
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiSuccess<T>;
    return json?.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchPublicCourses() {
  return (await fetchPublicData<PublicCourse[]>("/public/courses")) ?? [];
}

export async function fetchPublicCourse(slug: string) {
  return fetchPublicData<PublicCourse>(`/public/courses/${encodeURIComponent(slug)}`);
}
