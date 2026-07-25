import "server-only";

import { unstable_cache } from "next/cache";

import type { Locale } from "@/config/i18n";
import {
  committeeMembers as staticMembers,
  type CommitteeMember,
} from "@/config/committee";
import { getPayloadClient, mediaUrl } from "@/lib/cms/client";

async function fetchCommittee(
  locale: Locale,
): Promise<CommitteeMember[] | null> {
  try {
    const payload = await getPayloadClient();
    const result = await payload.find({
      collection: "committee-members",
      locale,
      depth: 1,
      limit: 20,
      sort: "order",
    });

    if (!result.docs.length) return null;

    return result.docs.map((doc) => ({
      id: String(doc.id),
      name: doc.name,
      role: doc.role,
      image: mediaUrl(
        doc.image,
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      ),
      social: {
        twitter: doc.social?.twitter || undefined,
        linkedin: doc.social?.linkedin || undefined,
        instagram: doc.social?.instagram || undefined,
        behance: doc.social?.behance || undefined,
      },
    }));
  } catch {
    return null;
  }
}

export async function getCmsCommittee(
  locale: Locale,
): Promise<CommitteeMember[]> {
  const cached = unstable_cache(
    () => fetchCommittee(locale),
    [`cms-committee-${locale}`],
    {
      tags: ["cms"],
      revalidate: 60,
    },
  );

  return (await cached()) ?? staticMembers;
}
