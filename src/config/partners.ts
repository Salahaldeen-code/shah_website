export type PartnerLogo = {
  id: string;
  src: string;
  alt: string;
  href?: string;
};

/** Default partner logos from /public/images/hero/Partners */
export const defaultPartnerLogos: PartnerLogo[] = Array.from(
  { length: 12 },
  (_, index) => {
    const n = index + 1;
    return {
      id: `partner-${n}`,
      src: `/images/hero/Partners/${n}.png`,
      alt: `Partner ${n}`,
    };
  },
);

export const partnersMarqueeConfig = {
  /** Seconds for one full loop. */
  rowDurationSec: 42,
  /** Logo tile height. */
  logoHeightRem: 4.25,
  logoHeightRemSm: 5,
} as const;
