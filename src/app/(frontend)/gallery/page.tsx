import type { Metadata } from "next";

import { GalleryIndex } from "@/components/gallery/GalleryIndex";
import { getCmsGalleryAlbums, getCmsGalleryUi } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and stories from Persatuan Sukan & Rekreasi activities.",
};

export default async function GalleryPage() {
  const locale = await getLocale();
  const [copy, albums] = await Promise.all([
    getCmsGalleryUi(locale),
    getCmsGalleryAlbums(locale),
  ]);

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <GalleryIndex locale={locale} copy={copy} albums={albums} />
    </main>
  );
}
