import { AboutSection } from "@/components/home/AboutSection";
import { ActiveLifeSection } from "@/components/home/ActiveLifeSection";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";
import { CenteredHeadingSection } from "@/components/home/CenteredHeadingSection";
import { ContactSection } from "@/components/home/ContactSection";
import { GallerySection } from "@/components/home/GallerySection";
import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

export default async function HomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <main className="pb-[var(--content-bottom-pad)]">
      <HeroSection />
      <CenteredHeadingSection heading={dictionary.heading.homeIntro} />
      <ActiveLifeSection copy={dictionary.showcase} />
      <ImpactSection />
      <ActivitiesSection />
      <GallerySection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
      <ContactSection />
    </main>
  );
}
