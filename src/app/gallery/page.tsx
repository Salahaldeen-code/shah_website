import type { Metadata } from "next";

import { GalleryIndex } from "@/components/gallery/GalleryIndex";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Photos and stories from past Persatuan Sukan & Rekreasi programs.",
};

export default async function GalleryPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <GalleryIndex
        locale={locale}
        copy={dictionary.gallery}
        programsCopy={dictionary.programs}
      />
    </main>
  );
}
