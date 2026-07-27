import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  programs as staticPrograms,
  type ProgramCategoryKey,
  type ProgramRecord,
} from "@/config/programs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPayloadClient, resolveMediaUrl } from "@/lib/cms/client";

export type CmsProgram = ProgramRecord & {
  title: string;
  venue: string;
  details: string;
  categoryLabel: string;
  /** Attached gallery photos for the program (covers the "album" use-case). */
  photos: string[];
  /** Optional muted/hover video. */
  video?: string | null;
};

async function fetchPrograms(locale: Locale): Promise<CmsProgram[] | null> {
  try {
    const payload = await getPayloadClient();
    // Fetch all programs from admin — do not hard-filter by date in the query,
    // otherwise empty CMS results silently fall back to old static sample data.
    const result = await payload.find({
      collection: "programs",
      locale,
      depth: 2,
      limit: 100,
      sort: "start",
    });

    if (!result.docs.length) return null;

    const dictionary = await getDictionary(locale);
    const cutoff = Date.now() - 1000 * 60 * 60 * 24;

    const mapped = await Promise.all(
      result.docs.map(async (doc) => {
        const categoryKey = (doc.category || "team") as ProgramCategoryKey;
        const image = await resolveMediaUrl(
          payload,
          doc.image as never,
          "/images/hero/image2.jpg",
        );
        const video = doc.video
          ? await resolveMediaUrl(payload, doc.video as never, "")
          : null;

        const photos = (
          await Promise.all(
            (doc.photos || []).map((row) =>
              resolveMediaUrl(payload, row?.image as never, ""),
            ),
          )
        ).filter(Boolean);

        const start =
          typeof doc.start === "string"
            ? doc.start
            : new Date(doc.start).toISOString();
        const end =
          typeof doc.end === "string"
            ? doc.end
            : new Date(doc.end).toISOString();

        return {
          id: String(doc.id),
          titleKey: "football" as const,
          categoryKey,
          venueKey: "mainField" as const,
          image,
          video: video || null,
          photos: photos.length ? photos : [image],
          start,
          end,
          title: doc.title,
          venue: doc.venue,
          details: doc.details || "",
          categoryLabel: dictionary.programs.categories[categoryKey],
        } satisfies CmsProgram;
      }),
    );

    const upcoming = mapped.filter(
      (program) => new Date(program.start).getTime() >= cutoff,
    );

    // Prefer upcoming; if admin only has older rows, still show CMS data
    // instead of falling back to static sample programs.
    return (upcoming.length ? upcoming : mapped).sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
  } catch (error) {
    console.error("[cms] programs fetch failed", error);
    return null;
  }
}

export async function getCmsPrograms(locale: Locale): Promise<CmsProgram[]> {
  const cached = unstable_cache(
    () => fetchPrograms(locale),
    [`cms-programs-${locale}`],
    { tags: ["cms"], revalidate: 10 },
  );

  const fromCms = await cached();
  if (fromCms?.length) return fromCms;

  const dictionary = await getDictionary(locale);
  return staticPrograms.map((program) => ({
    ...program,
    title: dictionary.programs.items[program.titleKey],
    venue: dictionary.programs.venues[program.venueKey],
    details: dictionary.programs.details[program.titleKey],
    categoryLabel: dictionary.programs.categories[program.categoryKey],
    photos: [program.image],
    video: null,
  }));
}
