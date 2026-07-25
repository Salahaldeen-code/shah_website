import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { GalleryAlbumView } from "@/components/gallery/GalleryAlbumView";
import {
  getCmsGalleryAlbum,
  getCmsGalleryAlbums,
  getCmsGalleryUi,
  getCmsProgramsUi,
} from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

type GalleryAlbumPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const albums = await getCmsGalleryAlbums("en");
  return albums.map((album) => ({ slug: album.slug }));
}

export async function generateMetadata({
  params,
}: GalleryAlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const album = await getCmsGalleryAlbum(locale, slug);
  if (!album) return { title: "Gallery" };

  return {
    title: album.title,
    description: album.summary,
  };
}

export default async function GalleryAlbumPage({
  params,
}: GalleryAlbumPageProps) {
  const { slug } = await params;
  const locale = await getLocale();
  const [album, copy, programsCopy] = await Promise.all([
    getCmsGalleryAlbum(locale, slug),
    getCmsGalleryUi(locale),
    getCmsProgramsUi(locale),
  ]);

  if (!album) notFound();

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <GalleryAlbumView
        album={album}
        locale={locale}
        copy={copy}
        programsCopy={programsCopy}
      />
    </main>
  );
}
