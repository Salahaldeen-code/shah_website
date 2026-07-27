import { PartnersMarquee } from "@/components/home/PartnersMarquee";
import { getCmsHomeHero } from "@/lib/cms";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function PartnersSection() {
  const locale = await getLocale();
  const [dictionary, hero] = await Promise.all([
    getDictionary(locale),
    getCmsHomeHero(locale),
  ]);

  return (
    <PartnersMarquee
      label={hero.partnersLabel || dictionary.partners.label}
      partners={hero.partners}
    />
  );
}
