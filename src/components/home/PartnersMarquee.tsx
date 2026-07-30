"use client";

import Image from "next/image";
import { useEffect, useState, type CSSProperties } from "react";

import {
  partnersMarqueeConfig,
  type PartnerLogo,
} from "@/config/partners";

type PartnersMarqueeProps = {
  label: string;
  partners: PartnerLogo[];
};

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}

function PartnerBadge({
  partner,
}: {
  partner: PartnerLogo;
}) {
  const { logoHeightRem, logoHeightRemSm } = partnersMarqueeConfig;

  const image = (
    <span
      className="partners-logo-tile relative inline-flex shrink-0 items-center justify-center"
      style={
        {
          "--partners-logo-h": `${logoHeightRem}rem`,
          "--partners-logo-h-sm": `${logoHeightRemSm}rem`,
        } as CSSProperties
      }
    >
      <Image
        src={partner.src}
        alt={partner.alt}
        width={160}
        height={160}
        className="h-[var(--partners-logo-h)] w-auto max-w-[9rem] object-contain sm:h-[var(--partners-logo-h-sm)] sm:max-w-[10.5rem]"
      />
    </span>
  );

  if (partner.href) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="noopener noreferrer"
        className="partners-logo-link inline-flex shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/80"
        aria-label={partner.alt}
      >
        {image}
      </a>
    );
  }

  return image;
}

function MarqueeRow({
  partners,
  durationSec,
  animate,
}: {
  partners: PartnerLogo[];
  durationSec: number;
  animate: boolean;
}) {
  const renderGroup = (keyPrefix: string) => (
    <div
      key={keyPrefix}
      className="flex shrink-0 items-center gap-8 pr-8 sm:gap-12 sm:pr-12"
    >
      {partners.map((partner) => (
        <PartnerBadge
          key={`${keyPrefix}-${partner.id}`}
          partner={partner}
        />
      ))}
    </div>
  );

  return (
    <div className="partners-marquee-viewport relative overflow-hidden">
      <div
        className={`partners-marquee-track flex w-max items-center ${
          animate ? "partners-marquee-left" : ""
        }`}
        style={
          animate
            ? ({
                "--partners-marquee-duration": `${durationSec}s`,
              } as CSSProperties)
            : undefined
        }
      >
        {renderGroup("a")}
        {renderGroup("b")}
      </div>
    </div>
  );
}

export function PartnersMarquee({ label, partners }: PartnersMarqueeProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (partners.length === 0) return null;

  const animate = !reducedMotion;

  return (
    <section
      aria-label={label}
      className="partners-section relative overflow-hidden bg-brand-dark"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-yellow to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-red/50 to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-container-max flex-col gap-6 px-container-padding py-10 sm:gap-8 sm:py-12 md:py-14">
        <div className="flex items-center justify-center gap-3">
          <span
            className="h-px w-8 bg-brand-yellow/70 sm:w-12"
            aria-hidden
          />
          <p className="font-display text-[0.7rem] tracking-[0.28em] text-brand-yellow uppercase sm:text-xs">
            {label}
          </p>
          <span
            className="h-px w-8 bg-brand-yellow/70 sm:w-12"
            aria-hidden
          />
        </div>

        <div className="partners-marquee-stack">
          <MarqueeRow
            partners={partners}
            durationSec={partnersMarqueeConfig.rowDurationSec}
            animate={animate}
          />
        </div>
      </div>
    </section>
  );
}
