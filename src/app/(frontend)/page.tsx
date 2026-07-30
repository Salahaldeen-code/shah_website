import { AboutSection } from "@/components/home/AboutSection";
import { ActiveLifeSection } from "@/components/home/ActiveLifeSection";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";
import { EditorialShowcaseSection } from "@/components/home/EditorialShowcaseSection";
import { GallerySection } from "@/components/home/GallerySection";
import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { PartnersSection } from "@/components/home/PartnersSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { ServicesSection } from "@/components/home/ServicesSection";

/** Keep homepage close to CMS edits (admin save also revalidates the `cms` tag). */
export const revalidate = 60;

export default function HomePage() {
  return (
    <main className="pb-[var(--content-bottom-pad)]">
      <HeroSection />
      <PartnersSection />
      <EditorialShowcaseSection />
      <ActiveLifeSection />
      <ImpactSection />
      <ActivitiesSection />
      <GallerySection />
      <AboutSection />
      <ServicesSection />
      <PortfolioSection />
    </main>
  );
}
