/** Default Payload nav ordering without a custom Nav component. */

export const NAV_GROUP_ORDER = [
  "Home",
  "About Us",
  "Gallery",
  "Contact",
  "Membership",
  "Site",
] as const;

const ORDERED_GROUPS = Object.fromEntries(
  NAV_GROUP_ORDER.map((group, index) => [group, `${index + 1}. ${group}`]),
) as Record<string, string>;

/** Lower number = higher in the sidebar. */
export const navEntityOrder: Record<string, number> = {
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
  "about-page": 10,
  "committee-members": 20,
  "gallery-ui": 10,
  "contact-page": 10,
  "membership-registrations": 10,
  "site-settings": 10,
  media: 20,
  users: 30,
};

function orderedLabel(slug: string, label: string) {
  const rank = navEntityOrder[slug];
  if (rank === undefined) return label;
  return `${rank}. ${label}`;
}

function orderedGroup(group?: string) {
  if (!group) return group;
  return ORDERED_GROUPS[group] ?? group;
}

export function applyAdminNavOrder<T extends { slug: string }>(entity: T): T {
  const admin = "admin" in entity ? (entity.admin as { group?: string }) : undefined;
  const group = orderedGroup(admin?.group);

  if ("label" in entity && typeof entity.label === "string") {
    return {
      ...entity,
      label: orderedLabel(entity.slug, entity.label),
      admin: {
        ...(admin ?? {}),
        group,
      },
    } as T;
  }

  if ("labels" in entity && entity.labels && typeof entity.labels === "object") {
    const labels = entity.labels as { singular?: unknown; plural?: unknown };
    const plural =
      typeof labels.plural === "string"
        ? orderedLabel(entity.slug, labels.plural)
        : labels.plural;

    return {
      ...entity,
      labels: {
        ...labels,
        plural,
      },
      admin: {
        ...(admin ?? {}),
        group,
      },
    } as T;
  }

  return {
    ...entity,
    admin: {
      ...(admin ?? {}),
      group,
    },
  } as T;
}
