import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  showcaseGridImages,
  showcaseSideImages,
} from "@/config/showcase";
import { getPayloadClient, resolveMediaUrl } from "@/lib/cms/client";

export type CmsCategory = {
  id: string;
  title: string;
  image: string;
};

async function fetchCategories(locale: Locale): Promise<CmsCategory[] | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "categories",
      locale,
      depth: 2,
      limit: 50,
      sort: "_order",
    });

    if (!result.docs.length) return null;

    const rows = await Promise.all(
      result.docs.map(async (doc) => {
        const src = await resolveMediaUrl(payload, doc.image as never, "");
        if (!src) return null;
        return {
          id: String(doc.id),
          title: doc.title,
          image: src,
        };
      }),
    );

    const categories = rows.filter((row): row is CmsCategory => row !== null);
    return categories.length ? categories : null;
  } catch (error) {
    console.error("[cms] categories fetch failed", error);
    return null;
  }
}

export async function getCmsCategories(locale: Locale): Promise<CmsCategory[]> {
  const cached = unstable_cache(
    () => fetchCategories(locale),
    [`cms-categories-${locale}`],
    { tags: ["cms"], revalidate: 10 },
  );

  const fromCms = await cached();
  if (fromCms?.length) return fromCms;

  const fallback = [
    ...showcaseSideImages.left,
    ...showcaseSideImages.right,
    ...showcaseGridImages,
  ];

  return fallback.map((img, index) => ({
    id: `fallback-cat-${index}`,
    title: img.alt || `Category ${index + 1}`,
    image: img.src,
  }));
}

/** Map categories into Active Life collage side + grid slots. */
export function categoriesToShowcaseImages(categories: CmsCategory[]) {
  const asTiles = categories.map((cat) => ({
    id: cat.id,
    src: cat.image,
    alt: cat.title,
  }));

  return {
    sideImages: asTiles.slice(0, 4),
    gridImages: asTiles.length > 4 ? asTiles : asTiles,
  };
}
