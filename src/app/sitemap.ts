import type { MetadataRoute } from "next";

import { mainNavigation } from "@/config/navigation";
import { getSiteUrl } from "@/lib/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return mainNavigation.map((item) => ({
    url: `${siteUrl}${item.href === "/" ? "" : item.href}`,
    lastModified: new Date(),
    changeFrequency: item.href === "/" ? "weekly" : "monthly",
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
