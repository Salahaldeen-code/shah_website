import Link from "next/link";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { MobileNav } from "@/components/layout/MobileNav";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/shared/Container";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { Locale } from "@/config/i18n";

type HeaderProps = {
  locale: Locale;
  dictionary: Dictionary;
};

export function Header({ locale, dictionary }: HeaderProps) {
  return (
    <header className="min-h-[var(--header-height)] border-b border-border">
      <Container className="flex min-h-[var(--header-height)] items-center justify-between gap-4">
        <Link href="/" aria-label={dictionary.nav.home}>
          {siteConfig.name}
        </Link>
        <Navbar dictionary={dictionary} />
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <MobileNav dictionary={dictionary} />
        </div>
      </Container>
    </header>
  );
}
