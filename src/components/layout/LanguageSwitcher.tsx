"use client";

import { locales, type Locale } from "@/config/i18n";
import { setLocale } from "@/lib/i18n/actions";

type LanguageSwitcherProps = {
  currentLocale: Locale;
};

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  return (
    <div>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          aria-pressed={currentLocale === locale}
          disabled={currentLocale === locale}
          onClick={() => {
            void setLocale(locale);
          }}
        >
          {locale}
        </button>
      ))}
    </div>
  );
}
