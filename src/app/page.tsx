import { AboutSection } from "@/components/home/AboutSection";
import { CenteredHeadingSection } from "@/components/home/CenteredHeadingSection";
import { ContactSection } from "@/components/home/ContactSection";
import { HeroSection } from "@/components/home/HeroSection";
import { MembershipSection } from "@/components/home/MembershipSection";
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
      <AboutSection />
      <ServicesSection />
      <MembershipSection />
      <PortfolioSection />
      <ContactSection />
    </main>
  );
}
