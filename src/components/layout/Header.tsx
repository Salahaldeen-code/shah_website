import Link from "next/link";

import { MobileNav } from "@/components/layout/MobileNav";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/shared/Container";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="min-h-[var(--header-height)] border-b border-border">
      <Container className="flex min-h-[var(--header-height)] items-center justify-between gap-4">
        <Link href="/" aria-label="Home">
          {siteConfig.name}
        </Link>
        <Navbar />
        <MobileNav />
      </Container>
    </header>
  );
}
