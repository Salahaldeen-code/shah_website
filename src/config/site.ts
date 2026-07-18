import type { SiteConfig } from "@/types";

export const siteConfig: SiteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "",
  description: process.env.NEXT_PUBLIC_SITE_DESCRIPTION ?? "",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};
