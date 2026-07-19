import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GalleryAlbumView } from "@/components/gallery/GalleryAlbumView";
import { getGalleryAlbum, getGallerySlugs } from "@/config/gallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

type GalleryAlbumPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getGallerySlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: GalleryAlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = getGalleryAlbum(slug);
  if (!album) return { title: "Gallery" };

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const albumCopy = dictionary.gallery.albums[album.slug];

  return {
    title: albumCopy.title,
    description: albumCopy.summary,
  };
}

export default async function GalleryAlbumPage({
  params,
}: GalleryAlbumPageProps) {
  const { slug } = await params;
  const album = getGalleryAlbum(slug);

  if (!album) notFound();

  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <GalleryAlbumView
        album={album}
        locale={locale}
        copy={dictionary.gallery}
        programsCopy={dictionary.programs}
      />
    </main>
  );
}
