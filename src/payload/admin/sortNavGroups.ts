import type { NavGroupType } from "@payloadcms/ui/shared";

import { NAV_GROUP_ORDER, navEntityOrder } from "./homeNavOrder.ts";

function groupRank(label: unknown): number {
  const key = String(label);
  const index = NAV_GROUP_ORDER.indexOf(
    key as (typeof NAV_GROUP_ORDER)[number],
  );
  return index === -1 ? 999 : index;
}

function entityRank(slug: string): number {
  return navEntityOrder[slug] ?? 999;
}

/** Sort sidebar groups and items for clearer CMS navigation. */
export function sortNavGroups(groups: NavGroupType[]): NavGroupType[] {
  return [...groups]
    .map((group) => ({
      ...group,
      entities: [...group.entities].sort((a, b) => {
        const byOrder = entityRank(a.slug) - entityRank(b.slug);
        if (byOrder !== 0) return byOrder;
        return String(a.label).localeCompare(String(b.label));
      }),
    }))
    .sort((a, b) => groupRank(a.label) - groupRank(b.label));
}
