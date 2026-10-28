import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo/site";

/** Crawl rules: public pages stay open; private and internal URLs do not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/search", "/*/search"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
