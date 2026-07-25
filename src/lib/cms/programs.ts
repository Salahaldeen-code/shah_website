import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  programs as staticPrograms,
  type ProgramCategoryKey,
  type ProgramRecord,
} from "@/config/programs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getPayloadClient, mediaUrl } from "@/lib/cms/client";

export type CmsProgram = ProgramRecord & {
  title: string;
  venue: string;
  details: string;
  categoryLabel: string;
};

async function fetchPrograms(locale: Locale): Promise<CmsProgram[] | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "programs",
      locale,
      depth: 1,
      limit: 100,
      sort: "_order",
      where: {
        start: {
          greater_than_equal: new Date(
            Date.now() - 1000 * 60 * 60 * 24,
          ).toISOString(),
        },
      },
    });

    if (!result.docs.length) return null;

    const dictionary = await getDictionary(locale);

    return result.docs.map((doc) => {
      const categoryKey = (doc.category || "team") as ProgramCategoryKey;
      return {
        id: String(doc.id),
        titleKey: "football" as const,
        categoryKey,
        venueKey: "mainField" as const,
        image: mediaUrl(doc.image, "/images/hero/image2.jpg"),
        start:
          typeof doc.start === "string"
            ? doc.start
            : new Date(doc.start).toISOString(),
        end:
          typeof doc.end === "string"
            ? doc.end
            : new Date(doc.end).toISOString(),
        title: doc.title,
        venue: doc.venue,
        details: doc.details || "",
        categoryLabel: dictionary.programs.categories[categoryKey],
      };
    });
  } catch {
    return null;
  }
}

export async function getCmsPrograms(locale: Locale): Promise<CmsProgram[]> {
  const cached = unstable_cache(
    () => fetchPrograms(locale),
    [`cms-programs-${locale}`],
    { tags: ["cms"], revalidate: 60 },
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
  }));
}
