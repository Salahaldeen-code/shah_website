import Link from "next/link";

import { mainNavigation } from "@/config/navigation";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type NavbarProps = {
  dictionary: Dictionary;
};

export function Navbar({ dictionary }: NavbarProps) {
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-6">
        {mainNavigation.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{dictionary.nav[item.labelKey]}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
