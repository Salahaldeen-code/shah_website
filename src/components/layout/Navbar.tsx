import Link from "next/link";

import { mainNavigation } from "@/config/navigation";

export function Navbar() {
  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-6">
        {mainNavigation.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
