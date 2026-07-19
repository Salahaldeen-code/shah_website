import { ScrollImpactSection } from "@/components/home/ScrollImpactSection";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function ImpactSection() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <section id="impact" className="relative">
      <ScrollImpactSection
        copy={dictionary.impact}
        programsCopy={dictionary.programs}
        locale={locale}
      />
    </section>
  );
}
