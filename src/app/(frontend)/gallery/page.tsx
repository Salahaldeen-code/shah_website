import type { Metadata } from "next";

import { GalleryIndex } from "@/components/gallery/GalleryIndex";
import { getCmsGalleryAlbums, getCmsGalleryUi, getCmsProgramsUi } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and stories from past Persatuan Sukan & Rekreasi programs.",
};

export default async function GalleryPage() {
  const locale = await getLocale();
  const [copy, programsCopy, albums] = await Promise.all([
    getCmsGalleryUi(locale),
    getCmsProgramsUi(locale),
    getCmsGalleryAlbums(locale),
  ]);

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <GalleryIndex
        locale={locale}
        copy={copy}
        programsCopy={programsCopy}
        albums={albums}
      />
    </main>
  );
}
