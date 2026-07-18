"use client";

import Link from "next/link";
import { useState } from "react";

import { mainNavigation } from "@/config/navigation";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((prev) => !prev)}
      />
      {open ? (
        <nav id="mobile-navigation" aria-label="Mobile">
          <ul>
            {mainNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
