import { AboutSection } from "@/components/home/AboutSection";
import { ActiveLifeSection } from "@/components/home/ActiveLifeSection";
import { ActivitiesSection } from "@/components/home/ActivitiesSection";
import { EditorialShowcaseSection } from "@/components/home/EditorialShowcaseSection";
import { GallerySection } from "@/components/home/GallerySection";
import { HeroSection } from "@/components/home/HeroSection";
import { ImpactSection } from "@/components/home/ImpactSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { ServicesSection } from "@/components/home/ServicesSection";

export default function HomePage() {
  return (
    <main className="pb-[var(--content-bottom-pad)]">
      <HeroSection />
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
