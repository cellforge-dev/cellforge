import type { MetadataRoute } from "next";

function siteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://cellforge.dev";
  try {
    return new URL(raw).origin;
  } catch {
    return "https://cellforge.dev";
  }
}

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/"
    },
    ...(origin ? { sitemap: `${origin}/sitemap.xml` } : {})
  };
}
