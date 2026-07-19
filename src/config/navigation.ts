import type { NavItem } from "@/types";

/**
 * Central navigation config.
 * - `page`: route links
 * - `section`: in-page anchors on the homepage (smooth scroll)
 */
export const mainNavigation: NavItem[] = [
  { href: "/", labelKey: "home", type: "page" },
  { href: "/#about", labelKey: "about", type: "section" },
  { href: "/#services", labelKey: "services", type: "section" },
  { href: "/#programs", labelKey: "programs", type: "section" },
  { href: "/#activities", labelKey: "activities", type: "section" },
  { href: "/#membership", labelKey: "membershipSection", type: "section" },
  { href: "/gallery", labelKey: "galleryPage", type: "page" },
  { href: "/#portfolio", labelKey: "portfolio", type: "section" },
  { href: "/#contact", labelKey: "contact", type: "section" },
  { href: "/about", labelKey: "aboutPage", type: "page" },
  { href: "/membership", labelKey: "membershipPage", type: "page" },
];
