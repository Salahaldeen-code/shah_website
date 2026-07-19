export type GalleryAlbumSlug =
  | "community-football-day"
  | "open-tennis-clinic"
  | "morning-fitness-circuit"
  | "lap-swim-session"
  | "badminton-social-night"
  | "trail-walk-hike";

export type GalleryAlbum = {
  slug: GalleryAlbumSlug;
  /** Cover image for listing cards */
  cover: string;
  date: string;
  venueKey: "mainField" | "courtA" | "studio" | "pool" | "hall" | "trailHead";
  categoryKey: "team" | "racket" | "fitness" | "aquatic" | "outdoor" | "youth";
  photos: readonly string[];
};

/**
 * Past program galleries — each album has event info + all photos.
 * Replace images with real event shots when available.
 */
export const galleryAlbums: readonly GalleryAlbum[] = [
  {
    slug: "community-football-day",
    cover: "/images/hero/image2.jpg",
    date: "2026-03-15",
    venueKey: "mainField",
    categoryKey: "team",
    photos: [
      "/images/hero/image2.jpg",
      "/images/hero/slide-1.png",
      "/images/hero/image1.jpg",
      "/images/hero/slide-2.png",
      "/images/hero/image5.jpg",
      "/images/hero/slide-3.png",
    ],
  },
  {
    slug: "open-tennis-clinic",
    cover: "/images/hero/image3.jpg",
    date: "2026-02-22",
    venueKey: "courtA",
    categoryKey: "racket",
    photos: [
      "/images/hero/image3.jpg",
      "/images/hero/slide-4.png",
      "/images/hero/image6.jpg",
      "/images/hero/slide-5.png",
      "/images/hero/image1.jpg",
    ],
  },
  {
    slug: "morning-fitness-circuit",
    cover: "/images/hero/image6.jpg",
    date: "2026-01-18",
    venueKey: "studio",
    categoryKey: "fitness",
    photos: [
      "/images/hero/image6.jpg",
      "/images/hero/slide-6.png",
      "/images/hero/image5.jpg",
      "/images/hero/image4.jpg",
      "/images/hero/slide-1.png",
      "/images/hero/slide-2.png",
    ],
  },
  {
    slug: "lap-swim-session",
    cover: "/images/hero/image4.jpg",
    date: "2025-12-07",
    venueKey: "pool",
    categoryKey: "aquatic",
    photos: [
      "/images/hero/image4.jpg",
      "/images/hero/slide-3.png",
      "/images/hero/image3.jpg",
      "/images/hero/slide-4.png",
    ],
  },
  {
    slug: "badminton-social-night",
    cover: "/images/hero/image6.jpg",
    date: "2025-11-29",
    venueKey: "hall",
    categoryKey: "racket",
    photos: [
      "/images/app/badminton.png",
      "/images/hero/image6.jpg",
      "/images/hero/slide-5.png",
      "/images/hero/image2.jpg",
      "/images/hero/slide-6.png",
      "/images/hero/image5.jpg",
    ],
  },
  {
    slug: "trail-walk-hike",
    cover: "/images/hero/image5.jpg",
    date: "2025-10-12",
    venueKey: "trailHead",
    categoryKey: "outdoor",
    photos: [
      "/images/hero/image5.jpg",
      "/images/hero/slide-1.png",
      "/images/hero/image1.jpg",
      "/images/hero/slide-2.png",
      "/images/hero/image6.jpg",
    ],
  },
] as const;

export function getGalleryAlbum(
  slug: string,
): GalleryAlbum | undefined {
  return galleryAlbums.find((album) => album.slug === slug);
}

export function getGallerySlugs(): GalleryAlbumSlug[] {
  return galleryAlbums.map((album) => album.slug);
}
