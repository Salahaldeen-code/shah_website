import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  activityItems as staticItems,
  activityPairs as staticPairs,
  activitiesMembershipImage,
  type ActivityItem,
  type ActivityPair,
  type ActivitySlot,
  type ActivityTagKey,
} from "@/config/activities";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPayloadClient, mediaUrl } from "@/lib/cms/client";

export type CmsActivityItem = ActivityItem & {
  title: string;
  tag: string;
};

async function fetchActivities(locale: Locale) {
  try {
    const payload = await getPayloadClient();
    const [items, ui] = await Promise.all([
      payload.find({
        collection: "activities",
        locale,
        depth: 1,
        limit: 20,
        sort: "_order",
      }),
      payload.findGlobal({
        slug: "home-activities",
        locale,
        depth: 1,
      }),
    ]);

    if (!items.docs.length) return null;

    const mapped: CmsActivityItem[] = items.docs.map((doc) => {
      const tagKey = (doc.tag || "outdoor") as ActivityTagKey;
      return {
        id: String(doc.id),
        slot: (doc.slot || "topLeft") as ActivitySlot,
        titleKey: "mountainBiking",
        tagKey,
        image: mediaUrl(doc.image, "/images/hero/image5.jpg"),
        video: mediaUrl(doc.video, "/videos/activities/outdoor.mp4"),
        title: doc.title,
        tag: tagKey,
      };
    });

    const byPair = new Map<string, CmsActivityItem[]>();
    items.docs.forEach((doc, index) => {
      const key = doc.pair || "pair-a";
      const list = byPair.get(key) ?? [];
      list.push(mapped[index]!);
      byPair.set(key, list);
    });

    const pairs: ActivityPair[] = [...byPair.entries()].map(([id, pairItems]) => ({
      id,
      items: [
        pairItems.find((i) => i.slot === "topLeft") ?? pairItems[0]!,
        pairItems.find((i) => i.slot === "bottomRight") ??
          pairItems[1] ??
          pairItems[0]!,
      ] as ActivityPair["items"],
    }));

    return {
      items: mapped,
      pairs: pairs.length ? pairs : staticPairs,
      ui: {
        title: ui.title,
        description: ui.description || "",
        membership: {
          titleLine1: ui.membership?.titleLine1 || "Join the",
          titleLine2: ui.membership?.titleLine2 || "Movement",
          description: ui.membership?.description || "",
          joinCta: ui.membership?.joinCta || "Become a member",
          imageAlt: ui.membership?.imageAlt || "",
          image: mediaUrl(ui.membership?.image, activitiesMembershipImage),
        },
      },
    };
  } catch {
    return null;
  }
}

export async function getCmsActivities(locale: Locale) {
  const cached = unstable_cache(
    () => fetchActivities(locale),
    [`cms-activities-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (fromCms) {
    const items = fromCms.items.map((item) => ({
      ...item,
      tag: dictionary.activities.tags[item.tagKey] ?? item.tag,
    }));
    return {
      ...fromCms,
      items,
      pairs: fromCms.pairs,
    };
  }

  return {
    items: staticItems.map((item) => ({
      ...item,
      title: dictionary.activities.items[item.titleKey],
      tag: dictionary.activities.tags[item.tagKey],
    })),
    pairs: staticPairs,
    ui: {
      title: dictionary.activities.title,
      description: dictionary.activities.description,
      membership: {
        ...dictionary.activities.membership,
        image: activitiesMembershipImage,
      },
    },
  };
}
