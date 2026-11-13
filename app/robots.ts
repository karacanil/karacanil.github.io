import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

// Rendered once at build time and exported as the static file /robots.txt.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
