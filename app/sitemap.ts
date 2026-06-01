import type { MetadataRoute } from "next";

function homeUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellforge.dev";
  try {
    return new URL("/", raw).href;
  } catch {
    return "https://cellforge.dev/";
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const url = homeUrl();
  return [
    {
      url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1
    }
  ];
}
