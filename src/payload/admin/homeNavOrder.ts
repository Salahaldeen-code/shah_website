/** Admin sidebar group order and entity order within each group. */

export const NAV_GROUP_ORDER = [
  "Home",
  "About Us",
  "Gallery",
  "Contact",
  "Membership",
  "Site",
] as const;

export type NavGroupLabel = (typeof NAV_GROUP_ORDER)[number];

/** Lower number = higher in the sidebar. */
export const navEntityOrder: Record<string, number> = {
  // Home — page order top → bottom
  "home-hero": 10,
  "home-editorial": 20,
  "home-showcase": 30,
  "home-impact": 40,
  "programs-ui": 50,
  programs: 60,
  "home-activities": 70,
  categories: 75,
  activities: 80,
  "home-footer": 90,

  // About Us
  "about-page": 10,
  "committee-members": 20,

  // Gallery
  "gallery-ui": 10,

  // Contact
  "contact-page": 10,

  // Membership
  "membership-registrations": 10,

  // Site
  "site-settings": 10,
  media: 20,
  users: 30,
};

/** @deprecated use NAV_GROUP_ORDER[0] */
export const HOME_GROUP = "Home";

/** @deprecated use navEntityOrder */
export const homeNavOrder = navEntityOrder;
