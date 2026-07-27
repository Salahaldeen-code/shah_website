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
import { getPayloadClient, resolveMediaUrl } from "@/lib/cms/client";

export type CmsActivityItem = ActivityItem & {
  title: string;
  tag: string;
  slug: string;
  photos: string[];
};

function categoryTitle(category: unknown, fallback: string): string {
  if (category && typeof category === "object" && "title" in category) {
    const title = (category as { title?: string }).title;
    if (title) return title;
  }
  return fallback;
}

async function fetchActivities(locale: Locale) {
  try {
    const payload = await getPayloadClient();
    const [items, ui] = await Promise.all([
      payload.find({
        collection: "activities",
        locale,
        depth: 2,
        limit: 50,
        sort: "_order",
      }),
      payload.findGlobal({
        slug: "home-activities",
        locale,
        depth: 2,
      }),
    ]);

    if (!items.docs.length) return null;

    const mapped: CmsActivityItem[] = await Promise.all(
      items.docs.map(async (doc, index) => {
        const tagLabel = categoryTitle(doc.category, "Activity");
        const fallbackTag = (
          ["outdoor", "community", "kids", "wellness"] as ActivityTagKey[]
        )[index % 4]!;

        const image = await resolveMediaUrl(
          payload,
          doc.image as never,
          "/images/hero/image5.jpg",
        );
        const video = await resolveMediaUrl(
          payload,
          doc.video as never,
          "/videos/activities/outdoor.mp4",
        );
        const albumPhotos = (
          await Promise.all(
            (Array.isArray(doc.photos) ? doc.photos : []).map((row) =>
              resolveMediaUrl(payload, row?.image as never, ""),
            ),
          )
        ).filter(Boolean);

        return {
          id: String(doc.id),
          slug: doc.slug || String(doc.id),
          slot: (doc.slot || "topLeft") as ActivitySlot,
          titleKey: "mountainBiking",
          tagKey: fallbackTag,
          image,
          video,
          title: doc.title,
          tag: tagLabel,
          // Fall back to cover so the reel always has at least one image.
          photos: albumPhotos.length ? albumPhotos : [image],
        };
      }),
    );

    const byPair = new Map<string, CmsActivityItem[]>();
    items.docs.forEach((doc, index) => {
      const key = doc.pair || "pair-a";
      const list = byPair.get(key) ?? [];
      list.push(mapped[index]!);
      byPair.set(key, list);
    });

    const pairs: ActivityPair[] = [...byPair.entries()]
      .map(([id, pairItems]) => {
        const top =
          pairItems.find((i) => i.slot === "topLeft") ?? pairItems[0];
        const bottom =
          pairItems.find((i) => i.slot === "bottomRight" && i.id !== top?.id) ??
          pairItems.find((i) => i.id !== top?.id) ??
          pairItems[1] ??
          top;
        if (!top || !bottom) return null;
        return {
          id,
          items: [
            { ...top, slot: "topLeft" as const },
            { ...bottom, slot: "bottomRight" as const },
          ] as ActivityPair["items"],
        };
      })
      .filter((pair): pair is ActivityPair => pair !== null);

    const orderedPairs = ["pair-a", "pair-b"]
      .map((id) => pairs.find((p) => p.id === id))
      .filter((pair): pair is ActivityPair => Boolean(pair));
    const remaining = pairs.filter(
      (p) => p.id !== "pair-a" && p.id !== "pair-b",
    );
    const stagePairs =
      orderedPairs.length + remaining.length >= 1
        ? [...orderedPairs, ...remaining]
        : staticPairs;

    return {
      items: mapped,
      pairs: stagePairs,
      ui: {
        title: ui.title,
        description: ui.description || "",
        membership: {
          titleLine1: ui.membership?.titleLine1 || "Join the",
          titleLine2: ui.membership?.titleLine2 || "Movement",
          description: ui.membership?.description || "",
          joinCta: ui.membership?.joinCta || "Become a member",
          imageAlt: ui.membership?.imageAlt || "",
          image: await resolveMediaUrl(
            payload,
            ui.membership?.image as never,
            activitiesMembershipImage,
          ),
        },
      },
    };
  } catch (error) {
    console.error("[cms] activities fetch failed", error);
    return null;
  }
}

export async function getCmsActivities(locale: Locale) {
  const cached = unstable_cache(
    () => fetchActivities(locale),
    [`cms-activities-${locale}`],
    { tags: ["cms"], revalidate: 10 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (fromCms) {
    return fromCms;
  }

  return {
    items: staticItems.map((item) => ({
      ...item,
      slug: item.id,
      title: dictionary.activities.items[item.titleKey],
      tag: dictionary.activities.tags[item.tagKey],
      photos: [item.image],
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

/** Flatten cover + album photos for the homepage parallax reel (shuffled). */
export function collectActivityReelImages(
  items: { title: string; image: string; photos?: string[] | null }[],
) {
  const pool: { src: string; alt: string }[] = [];
  const seen = new Set<string>();

  const push = (src: string | undefined, alt: string) => {
    if (!src || seen.has(src)) return;
    seen.add(src);
    pool.push({ src, alt });
  };

  for (const item of items) {
    push(item.image, item.title);
    const photos = Array.isArray(item.photos) ? item.photos : [];
    for (const photo of photos) {
      push(photo, item.title);
    }
  }

  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }

  return pool;
}
