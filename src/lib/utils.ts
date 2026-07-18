import { siteConfig } from "@/config/site";

export function getSiteUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}
