import Image from "next/image";
import Link from "next/link";

import { galleryAlbums } from "@/config/gallery";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type GalleryIndexProps = {
  locale: Locale;
  copy: Dictionary["gallery"];
  programsCopy: Dictionary["programs"];
};

export function GalleryIndex({ locale, copy, programsCopy }: GalleryIndexProps) {
  const intlLocale = locale === "ms" ? "ms-MY" : "en-MY";

  return (
    <div className="relative">
      <header className="border-b border-white/10">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] pt-16 pb-12 sm:pt-20 sm:pb-14">
          <p className="text-[0.7rem] tracking-[0.28em] text-brand-yellow uppercase">
            PSR
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.92] tracking-[0.04em] text-brand-yellow uppercase">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            {copy.subtitle}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-12 sm:py-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {galleryAlbums.map((album) => {
            const albumCopy = copy.albums[album.slug];
            const dateLabel = new Date(album.date).toLocaleDateString(
              intlLocale,
              { day: "numeric", month: "long", year: "numeric" },
            );

            return (
              <li key={album.slug}>
                <Link
                  href={`/gallery/${album.slug}`}
                  className="group block overflow-hidden border border-white/10 bg-white/[0.03] transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-yellow/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-brand-surface">
                    <Image
                      src={album.cover}
                      alt={albumCopy.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                    />
                    <span className="absolute bottom-3 left-3 rounded-sm bg-black/50 px-2 py-1 text-[0.58rem] tracking-[0.14em] text-brand-yellow uppercase backdrop-blur-sm">
                      {programsCopy.categories[album.categoryKey]}
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <h2 className="font-display text-xl tracking-[0.06em] text-white uppercase transition-colors group-hover:text-brand-yellow">
                      {albumCopy.title}
                    </h2>
                    <p className="mt-1.5 text-xs text-white/50">
                      {dateLabel}
                      <span className="mx-1.5 text-white/25">·</span>
                      {programsCopy.venues[album.venueKey]}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/60">
                      {albumCopy.summary}
                    </p>
                    <p className="mt-4 text-[0.65rem] tracking-[0.16em] text-brand-yellow uppercase">
                      {copy.viewAlbum}
                      <span aria-hidden="true" className="ml-1">
                        ›
                      </span>
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
