import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  heroShutterConfig,
  heroSlides,
  type HeroSlide,
} from "@/config/carousel";
import {
  defaultPartnerLogos,
  type PartnerLogo,
} from "@/config/partners";
import { getDictionary } from "@/lib/i18n/dictionaries";
import {
  categoriesToShowcaseImages,
  getCmsCategories,
} from "@/lib/cms/categories";
import { getPayloadClient, mediaUrl } from "@/lib/cms/client";

async function fetchGlobal<T>(
  slug:
    | "site-settings"
    | "home-hero"
    | "home-showcase"
    | "home-impact"
    | "home-editorial"
    | "about-page"
    | "contact-page"
    | "programs-ui"
    | "gallery-ui",
  locale: Locale,
): Promise<T | null> {
  try {
    const payload = await getPayloadClient();
    const doc = await payload.findGlobal({
      slug,
      locale,
      depth: 2,
    });
    return doc as T;
  } catch {
    return null;
  }
}

export async function getCmsHomeHero(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("home-hero", locale),
    [`cms-home-hero-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const fallbackTitle = heroShutterConfig.marqueeText;

  const cmsSlides = Array.isArray(fromCms?.slides)
    ? (fromCms.slides as {
        image?: unknown;
        video?: unknown;
        alt?: string;
        youtubeId?: string | null;
        id?: string | null;
      }[])
        .map((row, index): HeroSlide | null => {
          const src = mediaUrl(row.image as never, "");
          if (!src) return null;
          const videoSrc = mediaUrl(row.video as never, "");
          const youtubeId =
            !videoSrc && row.youtubeId?.trim()
              ? row.youtubeId.trim()
              : undefined;
          return {
            id: row.id ? String(row.id) : `cms-hero-${index}`,
            src,
            alt: row.alt?.trim() || `Hero slide ${index + 1}`,
            ...(videoSrc ? { video: videoSrc } : {}),
            ...(youtubeId ? { youtubeId } : {}),
          };
        })
        .filter((slide): slide is HeroSlide => slide !== null)
    : [];

  const cmsPartners = Array.isArray(fromCms?.partners)
    ? (fromCms.partners as {
        logo?: unknown;
        name?: string;
        url?: string | null;
        id?: string | null;
      }[])
        .map((row, index): PartnerLogo | null => {
          const src = mediaUrl(row.logo as never, "");
          if (!src) return null;
          const href = row.url?.trim() || undefined;
          return {
            id: row.id ? String(row.id) : `cms-partner-${index}`,
            src,
            alt: row.name?.trim() || `Partner ${index + 1}`,
            ...(href ? { href } : {}),
          };
        })
        .filter((partner): partner is PartnerLogo => partner !== null)
    : [];

  return {
    title: String(fromCms?.title ?? fallbackTitle).trim() || fallbackTitle,
    slides: cmsSlides.length >= 1 ? cmsSlides : heroSlides,
    partnersLabel: String(fromCms?.partnersLabel ?? "").trim(),
    partners: cmsPartners.length > 0 ? cmsPartners : defaultPartnerLogos,
  };
}

export async function getCmsAboutPage(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("about-page", locale),
    [`cms-about-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (!fromCms?.title) {
    return {
      copy: dictionary.aboutPage,
      heroImage: "/images/hero/image5.jpg",
      storyImage: "/images/hero/image6.jpg",
    };
  }

  const pillars = Array.isArray(fromCms.pillars)
    ? Object.fromEntries(
        (fromCms.pillars as { key: string; title: string; body: string }[]).map(
          (p) => [p.key, { title: p.title, body: p.body }],
        ),
      )
    : dictionary.aboutPage.pillars;

  return {
    copy: {
      ...dictionary.aboutPage,
      eyebrow: String(fromCms.eyebrow ?? dictionary.aboutPage.eyebrow),
      title: String(fromCms.title),
      lead: String(fromCms.lead ?? dictionary.aboutPage.lead),
      storyTitle: String(fromCms.storyTitle ?? dictionary.aboutPage.storyTitle),
      story: String(fromCms.story ?? dictionary.aboutPage.story),
      missionTitle: String(
        fromCms.missionTitle ?? dictionary.aboutPage.missionTitle,
      ),
      mission: String(fromCms.mission ?? dictionary.aboutPage.mission),
      visionTitle: String(
        fromCms.visionTitle ?? dictionary.aboutPage.visionTitle,
      ),
      vision: String(fromCms.vision ?? dictionary.aboutPage.vision),
      committeeTitle: String(
        fromCms.committeeTitle ?? dictionary.aboutPage.committeeTitle,
      ),
      committeeSubtitle: String(
        fromCms.committeeSubtitle ?? dictionary.aboutPage.committeeSubtitle,
      ),
      pillarsTitle: String(
        fromCms.pillarsTitle ?? dictionary.aboutPage.pillarsTitle,
      ),
      pillars: pillars as typeof dictionary.aboutPage.pillars,
      ctaTitle: String(fromCms.ctaTitle ?? dictionary.aboutPage.ctaTitle),
      ctaBody: String(fromCms.ctaBody ?? dictionary.aboutPage.ctaBody),
      ctaMembership: String(
        fromCms.ctaMembership ?? dictionary.aboutPage.ctaMembership,
      ),
      ctaActivities: String(
        fromCms.ctaActivities ?? dictionary.aboutPage.ctaActivities,
      ),
    },
    heroImage: mediaUrl(fromCms.heroImage as never, "/images/hero/image5.jpg"),
    storyImage: mediaUrl(
      fromCms.storyImage as never,
      "/images/hero/image6.jpg",
    ),
  };
}

export async function getCmsContactPage(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("contact-page", locale),
    [`cms-contact-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (!fromCms?.title) {
    return {
      copy: dictionary.contactPage,
      image: "/images/app/contact.jpg",
    };
  }

  return {
    copy: {
      ...dictionary.contactPage,
      ...fromCms,
      form: {
        ...dictionary.contactPage.form,
        ...((fromCms.form as object) || {}),
        errors: dictionary.contactPage.form.errors,
      },
    } as typeof dictionary.contactPage,
    image: mediaUrl(fromCms.image as never, "/images/app/contact.jpg"),
  };
}

export async function getCmsShowcase(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("home-showcase", locale),
    [`cms-showcase-${locale}`],
    { tags: ["cms"], revalidate: 10 },
  );

  const [fromCms, categories] = await Promise.all([
    cached(),
    getCmsCategories(locale),
  ]);
  const dictionary = await getDictionary(locale);
  const fromCategories = categoriesToShowcaseImages(categories);

  const copy = fromCms?.brandLine1
    ? {
        brandLine1: String(fromCms.brandLine1),
        brandLine2: String(fromCms.brandLine2),
        brandAmp: String(fromCms.brandAmp),
        brandLine3: String(fromCms.brandLine3),
        script: String(fromCms.script),
        tagline: String(fromCms.tagline),
        viewMore: String(fromCms.viewMore ?? dictionary.showcase.viewMore),
      }
    : dictionary.showcase;

  return {
    copy,
    sideImages: fromCategories.sideImages.length
      ? fromCategories.sideImages
      : null,
    gridImages: fromCategories.gridImages.length
      ? fromCategories.gridImages
      : null,
  };
}

export async function getCmsImpact(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("home-impact", locale),
    [`cms-impact-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (!fromCms?.lineA) {
    return {
      copy: dictionary.impact,
      images: null as {
        background: { src: string; alt: string };
        floatLeft: { src: string; alt: string };
        floatRight: { src: string; alt: string };
      } | null,
    };
  }

  return {
    copy: {
      lineA: String(fromCms.lineA),
      lineB: String(fromCms.lineB),
      scriptA: String(fromCms.scriptA),
      scriptB: String(fromCms.scriptB),
    },
    images: {
      background: {
        src: mediaUrl(
          fromCms.background as never,
          "/images/app/MY.jpg",
        ),
        alt: "Impact background",
      },
      floatLeft: {
        src: mediaUrl(fromCms.floatLeft as never, "/images/hero/image1.jpg"),
        alt: "Impact float left",
      },
      floatRight: {
        src: mediaUrl(fromCms.floatRight as never, "/images/hero/image3.jpg"),
        alt: "Impact float right",
      },
    },
  };
}

export async function getCmsEditorial(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("home-editorial", locale),
    [`cms-editorial-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (!fromCms?.topText) {
    return dictionary.editorial;
  }

  return {
    topText: String(fromCms.topText),
    middleText: String(fromCms.middleText ?? dictionary.editorial.middleText),
    bottomText: String(fromCms.bottomText ?? dictionary.editorial.bottomText),
    overlayText: String(
      fromCms.overlayText ?? dictionary.editorial.overlayText,
    ),
  };
}

export async function getCmsProgramsUi(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("programs-ui", locale),
    [`cms-programs-ui-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (!fromCms?.title) return dictionary.programs;

  return {
    ...dictionary.programs,
    title: String(fromCms.title),
    subtitle: String(fromCms.subtitle ?? dictionary.programs.subtitle),
    empty: String(fromCms.empty ?? dictionary.programs.empty),
    join: String(fromCms.join ?? dictionary.programs.join),
    joinNow: String(fromCms.joinNow ?? dictionary.programs.joinNow),
    close: String(fromCms.close ?? dictionary.programs.close),
    viewAll: String(fromCms.viewAll ?? dictionary.programs.viewAll),
    showLess: String(fromCms.showLess ?? dictionary.programs.showLess),
    filters: {
      ...dictionary.programs.filters,
      ...((fromCms.filters as object) || {}),
    },
  };
}

export async function getCmsGalleryUi(locale: Locale) {
  const cached = unstable_cache(
    () => fetchGlobal<Record<string, unknown>>("gallery-ui", locale),
    [`cms-gallery-ui-${locale}`],
    { tags: ["cms"], revalidate: 60 },
  );

  const fromCms = await cached();
  const dictionary = await getDictionary(locale);

  if (!fromCms?.title) return dictionary.gallery;

  return {
    ...dictionary.gallery,
    title: String(fromCms.title),
    subtitle: String(fromCms.subtitle ?? dictionary.gallery.subtitle),
    viewAlbum: String(fromCms.viewAlbum ?? dictionary.gallery.viewAlbum),
    backToGallery: String(
      fromCms.backToGallery ?? dictionary.gallery.backToGallery,
    ),
    photosHeading: String(
      fromCms.photosHeading ?? dictionary.gallery.photosHeading,
    ),
    photoCount: String(fromCms.photoCount ?? dictionary.gallery.photoCount),
  };
}
