import { ScrollImpactSection } from "@/components/home/ScrollImpactSection";
import { getCmsImpact, getCmsPrograms, getCmsProgramsUi } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

export async function ImpactSection() {
  const locale = await getLocale();
  const [impact, programsCopy, programs] = await Promise.all([
    getCmsImpact(locale),
    getCmsProgramsUi(locale),
    getCmsPrograms(locale),
  ]);

  return (
    <section id="impact" className="relative">
      <ScrollImpactSection
        copy={impact.copy}
        programsCopy={programsCopy}
        programs={programs}
        images={impact.images}
        locale={locale}
      />
    </section>
  );
}
