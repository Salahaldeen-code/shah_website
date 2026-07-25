import type { Metadata } from "next";

import { AboutPageContent } from "@/components/about/AboutPageContent";
import { getCmsAboutPage, getCmsCommittee } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Persatuan Sukan & Rekreasi — community, sports, and active living.",
};

export default async function AboutPage() {
  const locale = await getLocale();
  const [about, committee] = await Promise.all([
    getCmsAboutPage(locale),
    getCmsCommittee(locale),
  ]);

  return (
    <main className="min-h-svh bg-brand-dark pb-[var(--content-bottom-pad)] text-white">
      <AboutPageContent
        copy={about.copy}
        heroImage={about.heroImage}
        storyImage={about.storyImage}
        committee={committee}
      />
    </main>
  );
}
