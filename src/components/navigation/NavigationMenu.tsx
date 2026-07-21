"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { locales, type Locale } from "@/config/i18n";
import { mainNavigation } from "@/config/navigation";
import { setLocale } from "@/lib/i18n/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { NavItem } from "@/types";

type NavigationMenuProps = {
  locale: Locale;
  dictionary: Dictionary;
  onNavigate: () => void;
};

function getHashFromHref(href: string) {
  const hashIndex = href.indexOf("#");
  return hashIndex >= 0 ? href.slice(hashIndex) : "";
}

function isNavItemActive(item: NavItem, pathname: string, hash: string) {
  if (item.type === "section") {
    if (pathname !== "/") return false;
    return hash === getHashFromHref(item.href);
  }

  if (item.href === "/") {
    return pathname === "/" && hash === "";
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function NavigationMenu({
  locale,
  dictionary,
  onNavigate,
}: NavigationMenuProps) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-center gap-3 px-3 pt-3 pb-2 sm:gap-4 sm:px-4 sm:pt-3.5">
        {locales.map((code) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              aria-pressed={active}
              className={`font-display text-[0.65rem] tracking-[0.16em] uppercase transition sm:text-xs ${
                active
                  ? "text-brand-yellow underline decoration-2 underline-offset-6"
                  : "text-nav-fg/50 hover:text-nav-fg"
              }`}
              onClick={() => {
                if (!active) {
                  void setLocale(code);
                }
              }}
            >
              {dictionary.locale[code]}
            </button>
          );
        })}
      </div>

      <nav
        aria-label={dictionary.a11y.mainNavigation}
        className="min-h-0 overflow-y-auto border-t border-nav-divider"
      >
        <ul>
          {mainNavigation.map((item, index) => {
            const active = isNavItemActive(item, pathname, hash);
            const isCta = index === 0;

            return (
              <li
                key={`${item.href}-${item.labelKey}`}
                className="border-b border-nav-divider last:border-b-0"
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 px-4 py-3 font-display text-lg tracking-[0.08em] uppercase transition sm:px-4 sm:py-3 sm:text-xl ${
                    isCta
                      ? "bg-nav-cta text-brand-yellow"
                      : "text-brand-yellow hover:bg-brand-red/15"
                  }`}
                  onClick={(event) => {
                    if (item.type === "section") {
                      const hash = getHashFromHref(item.href);
                      if (hash && pathname === "/") {
                        event.preventDefault();
                        window.history.pushState(null, "", hash);
                        document
                          .querySelector(hash)
                          ?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          });
                        window.dispatchEvent(new Event("hashchange"));
                      }
                    }
                    onNavigate();
                  }}
                >
                  <span>{dictionary.nav[item.labelKey]}</span>
                  {item.type === "section" ? (
                    <span
                      aria-hidden="true"
                      className="border-l border-nav-divider pl-3 text-sm text-brand-yellow/70"
                    >
                      →
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
