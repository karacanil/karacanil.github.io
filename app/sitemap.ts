import type { MetadataRoute } from "next";
import { getPublishedArticles } from "./lib/articles";
import { SITE_URL } from "./lib/site";

// Rendered once at build time and exported as the static file /sitemap.xml.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/` },
    { url: `${SITE_URL}/about/` },
    ...getPublishedArticles().map((article) => ({
      url: `${SITE_URL}/writing/${article.slug}/`,
      lastModified: new Date(`${article.date}T00:00:00Z`),
    })),
  ];
}
