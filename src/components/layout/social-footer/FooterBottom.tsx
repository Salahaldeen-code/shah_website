import Link from "next/link";

import { socialFooterConfig } from "@/config/socialFooter";

export function FooterBottom() {
  const { bottom, colors } = socialFooterConfig;

  return (
    <div className="w-full">
      <hr
        className="border-0 border-t"
        style={{ borderColor: colors.divider }}
        aria-hidden
      />

      <div className="mx-auto grid w-full max-w-[90rem] gap-6 px-[var(--container-padding)] py-6 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4 sm:py-7">
        <nav
          aria-label="Legal"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 justify-self-start"
        >
          {bottom.links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-[0.65rem] tracking-[0.22em] uppercase transition-opacity hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-dark sm:text-xs"
              style={{ color: colors.text }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {bottom.partnerLabel ? (
          <p
            className="justify-self-center text-center font-display text-[0.6rem] tracking-[0.28em] uppercase opacity-60 sm:text-[0.65rem]"
            style={{ color: colors.text }}
            aria-label="Partner logos placeholder"
          >
            {bottom.partnerLabel}
          </p>
        ) : (
          <span className="hidden sm:block" aria-hidden />
        )}

        <div
          className="flex flex-col items-start gap-1 justify-self-start sm:items-end sm:justify-self-end sm:text-right"
          style={{ color: colors.text }}
        >
          <p className="font-display text-[0.65rem] tracking-[0.18em] uppercase sm:text-xs">
            {bottom.copyright}
          </p>
          <p className="font-display text-[0.65rem] tracking-[0.22em] uppercase opacity-75 sm:text-xs">
            {bottom.madeBy}
          </p>
        </div>
      </div>
    </div>
  );
}
