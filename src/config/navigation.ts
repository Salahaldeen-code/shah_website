import type { NavItem } from "@/types";

/**
 * Central navigation config.
 * - `page`: route links
 * - `section`: in-page anchors on the homepage (smooth scroll)
 */
export const mainNavigation: NavItem[] = [
  { href: "/", labelKey: "home", type: "page" },
  { href: "/about", labelKey: "about", type: "page" },
  { href: "/#programs", labelKey: "programs", type: "section" },
  { href: "/#activities", labelKey: "activities", type: "section" },
  { href: "/membership", labelKey: "membership", type: "page" },
  { href: "/gallery", labelKey: "gallery", type: "page" },
  { href: "/contact", labelKey: "contact", type: "page" },
];
