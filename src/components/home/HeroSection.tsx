import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export async function HeroSection() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <HeroCarousel
      labels={{
        carousel: dictionary.a11y.carousel,
        slideStatus: dictionary.a11y.slideStatus,
      }}
    />
  );
}
