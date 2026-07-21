export type { Locale } from "@/config/i18n";

export type NavLabelKey =
  | "home"
  | "about"
  | "programs"
  | "activities"
  | "membership"
  | "gallery"
  | "contact";

export type NavItemType = "page" | "section";

export type NavItem = {
  href: string;
  labelKey: NavLabelKey;
  type: NavItemType;
};

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
};
