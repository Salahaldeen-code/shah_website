import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import { galleryAlbums as staticAlbums } from "@/config/gallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPayloadClient, resolveMediaUrl } from "@/lib/cms/client";

export type CmsGalleryAlbum = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  date: string;
  venue: string;
  /** Display label from the related category (or fallback). */
  categoryLabel: string;
  cover: string;
  photos: string[];
};

function categoryLabelFrom(category: unknown, fallback: string) {
  if (category && typeof category === "object" && "title" in category) {
    const title = (category as { title?: string }).title;
    if (title) return title;
  }
  return fallback;
}

async function fetchActivityAlbums(
  locale: Locale,
): Promise<CmsGalleryAlbum[] | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "activities",
      locale,
      depth: 2,
      limit: 100,
      sort: "-date",
    });

    if (!result.docs.length) return null;

    return Promise.all(
      result.docs.map(async (doc) => {
        const cover = await resolveMediaUrl(
          payload,
          doc.image as never,
          "/images/hero/image1.jpg",
        );
        const photos = (
          await Promise.all(
            (doc.photos || []).map((row) =>
              resolveMediaUrl(payload, row?.image as never, ""),
            ),
          )
        ).filter(Boolean);

        const albumPhotos = photos.length ? photos : [cover];

        const dateValue = doc.date
          ? typeof doc.date === "string"
            ? doc.date
            : new Date(doc.date).toISOString()
          : new Date().toISOString();

        return {
          slug: doc.slug || String(doc.id),
          title: doc.title,
          summary: doc.summary || "",
          description: doc.description || "",
          date: dateValue,
          venue: doc.venue || "",
          categoryLabel: categoryLabelFrom(doc.category, "Activity"),
          cover,
          photos: albumPhotos,
        };
      }),
    );
  } catch (error) {
    console.error("[cms] gallery/activities fetch failed", error);
    return null;
  }
}

export async function getCmsGalleryAlbums(
  locale: Locale,
): Promise<CmsGalleryAlbum[]> {
  const cached = unstable_cache(
    () => fetchActivityAlbums(locale),
    [`cms-gallery-activities-${locale}`],
    { tags: ["cms"], revalidate: 10 },
  );

  const fromCms = await cached();
  if (fromCms?.length) return fromCms;

  const dictionary = await getDictionary(locale);
  return staticAlbums.map((album) => {
    const copy = dictionary.gallery.albums[album.slug];
    return {
      slug: album.slug,
      title: copy?.title ?? album.slug,
      summary: copy?.summary ?? "",
      description: copy?.description ?? "",
      date: album.date,
      venue: dictionary.programs.venues[album.venueKey],
      categoryLabel:
        dictionary.programs.categories[album.categoryKey] ?? album.categoryKey,
      cover: album.cover,
      photos: [...album.photos],
    };
  });
}

export async function getCmsGalleryAlbum(
  locale: Locale,
  slug: string,
): Promise<CmsGalleryAlbum | null> {
  const albums = await getCmsGalleryAlbums(locale);
  return albums.find((album) => album.slug === slug) ?? null;
}
