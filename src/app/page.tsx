import { AboutSection } from "@/components/home/AboutSection";
import { ContactSection } from "@/components/home/ContactSection";
import { HeroSection } from "@/components/home/HeroSection";
import { MembershipSection } from "@/components/home/MembershipSection";
import { PortfolioSection } from "@/components/home/PortfolioSection";
import { ServicesSection } from "@/components/home/ServicesSection";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <ServicesSection />
      <MembershipSection />
      <PortfolioSection />
      <ContactSection />
    </main>
  );
}
