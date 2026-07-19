import Image from "next/image";
import Link from "next/link";

import type { GalleryAlbum } from "@/config/gallery";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type GalleryAlbumViewProps = {
  album: GalleryAlbum;
  locale: Locale;
  copy: Dictionary["gallery"];
  programsCopy: Dictionary["programs"];
};

export function GalleryAlbumView({
  album,
  locale,
  copy,
  programsCopy,
}: GalleryAlbumViewProps) {
  const intlLocale = locale === "ms" ? "ms-MY" : "en-MY";
  const albumCopy = copy.albums[album.slug];
  const dateLabel = new Date(album.date).toLocaleDateString(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="relative">
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src={album.cover}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-40"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-brand-dark/60 via-brand-dark/85 to-brand-dark"
          />
        </div>

        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] pt-14 pb-12 sm:pt-16 sm:pb-14">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-1.5 text-[0.65rem] tracking-[0.16em] text-brand-yellow/80 uppercase transition hover:text-brand-yellow"
          >
            <span aria-hidden="true">‹</span>
            {copy.backToGallery}
          </Link>

          <p className="mt-5 text-[0.65rem] tracking-[0.22em] text-brand-yellow uppercase">
            {programsCopy.categories[album.categoryKey]}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-[clamp(2.2rem,7vw,4.25rem)] leading-[0.92] tracking-[0.04em] text-white uppercase">
            {albumCopy.title}
          </h1>

          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/70">
            <div>
              <dt className="text-[0.58rem] tracking-[0.16em] text-white/40 uppercase">
                {copy.labels.date}
              </dt>
              <dd className="mt-1">{dateLabel}</dd>
            </div>
            <div>
              <dt className="text-[0.58rem] tracking-[0.16em] text-white/40 uppercase">
                {copy.labels.venue}
              </dt>
              <dd className="mt-1">{programsCopy.venues[album.venueKey]}</dd>
            </div>
            <div>
              <dt className="text-[0.58rem] tracking-[0.16em] text-white/40 uppercase">
                {copy.labels.photos}
              </dt>
              <dd className="mt-1">
                {album.photos.length} {copy.photoCount}
              </dd>
            </div>
          </dl>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75">
            {albumCopy.description}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-12 sm:py-16">
        <h2 className="font-display text-2xl tracking-[0.08em] text-brand-yellow uppercase sm:text-3xl">
          {copy.photosHeading}
        </h2>

        <ul className="mt-8 columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3">
          {album.photos.map((src, index) => (
            <li
              key={`${album.slug}-${index}`}
              className="mb-3 break-inside-avoid overflow-hidden border border-white/10 bg-brand-surface sm:mb-4"
            >
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={src}
                  alt={`${albumCopy.title} — ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-12 text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center justify-center border border-brand-yellow bg-transparent px-7 py-3 font-display text-sm tracking-[0.16em] text-brand-yellow uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-brand-yellow hover:text-brand-dark"
          >
            {copy.backToGallery}
          </Link>
        </div>
      </div>
    </article>
  );
}
