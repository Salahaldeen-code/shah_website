import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  galleryAlbums as staticAlbums,
  type GalleryAlbum,
} from "@/config/gallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPayloadClient, mediaUrl } from "@/lib/cms/client";

export type CmsGalleryAlbum = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  date: string;
  venue: string;
  categoryKey: GalleryAlbum["categoryKey"];
  cover: string;
  photos: string[];
};

async function fetchAlbums(locale: Locale): Promise<CmsGalleryAlbum[] | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "gallery-albums",
      locale,
      depth: 1,
      limit: 100,
      sort: "-date",
    });

    if (!result.docs.length) return null;

    return result.docs.map((doc) => ({
      slug: doc.slug,
      title: doc.title,
      summary: doc.summary || "",
      description: doc.description || "",
      date: typeof doc.date === "string" ? doc.date : new Date(doc.date).toISOString(),
      venue: doc.venue || "",
      categoryKey: (doc.category || "team") as GalleryAlbum["categoryKey"],
      cover: mediaUrl(doc.cover, "/images/hero/image1.jpg"),
      photos: (doc.photos || [])
        .map((row) => mediaUrl(row.image, ""))
        .filter(Boolean),
    }));
  } catch {
    return null;
  }
}

export async function getCmsGalleryAlbums(
  locale: Locale,
): Promise<CmsGalleryAlbum[]> {
  const cached = unstable_cache(
    () => fetchAlbums(locale),
    [`cms-gallery-${locale}`],
    { tags: ["cms"], revalidate: 60 },
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
      categoryKey: album.categoryKey,
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
