export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
};

export const heroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    src: "/images/hero/image1.jpg",
    alt: "Hero slide 1",
  },
  {
    id: "slide-2",
    src: "/images/hero/image2.jpg",
    alt: "Hero slide 2",
  },
  {
    id: "slide-3",
    src: "/images/hero/image3.jpg",
    alt: "Hero slide 3",
  },
  {
    id: "slide-4",
    src: "/images/hero/image4.jpg",
    alt: "Hero slide 4",
  },
  {
    id: "slide-5",
    src: "/images/hero/image5.jpg",
    alt: "Hero slide 5",
  },
  {
    id: "slide-6",
    src: "/images/hero/image6.jpg",
    alt: "Hero slide 6",
  },
];

/** Each progress line maps to two slides: [first, second]. */
export const heroPairs: readonly [number, number][] = [
  [0, 1],
  [2, 3],
  [4, 5],
] as const;

/**
 * Continuous pair timeline (progress never pauses).
 * Pattern: open at start (except first Line 1) → hold open to midpoint → close → hold closed.
 */
export const heroCarouselConfig = {
  /** Uninterrupted fill duration for one progress line. */
  pairCycleMs: 7000,
  /** Midpoint where bars close (~50%). Same as phaseEnds.openHold. */
  midpoint: 0.5,
  phaseEnds: {
    /** 0 → opening: bars open from combined (~420ms). Skipped on first Line 1. */
    opening: 0.06,
    /** opening → openHold: bars fully open and still (until midpoint). */
    openHold: 0.5,
    /** openHold → closing: bars close to middle (~420ms). */
    closing: 0.56,
    /** closing → 1: bars fully closed and still. */
  },
  swipeThresholdPx: 48,
} as const;

/** Bar height as a fraction of the measured hero container height. */
export const shutterBarHeightRatio = {
  base: 0.14,
  sm: 0.15,
  lg: 0.16,
} as const;

export const heroShutterConfig = {
  /** Shared word shown in both bars (split across the seam). */
  marqueeText: "PSR",
  /** How many times to repeat the word in the display string. */
  marqueeRepeat: 8,
  /** Full horizontal marquee loop duration in seconds (lower = faster). */
  marqueeDurationSec: 16,
  /** Glyph height as multiplier of --shutter-bar-height. */
  fontSizeScale: 1.55,
  /** Letter spacing in em. */
  letterSpacingEm: 0.08,
  /** Duration of one letter's vertical roll in ms. */
  letterDurationMs: 900,
  /** Delay between consecutive letter rolls in ms. */
  letterStaggerMs: 180,
  /** Pause after the last letter before the sequence restarts in ms. */
  sequencePauseMs: 800,
  /** Vertical scale at top/bottom edges (squash). */
  squashScaleY: 0.12,
  /** Horizontal scale at top/bottom edges (stretch). */
  squashScaleX: 1.35,
  accentText: "",
} as const;

export type TimelinePhase =
  | "opening"
  | "openHold"
  | "closing"
  | "closedHold";

export type TimelineOptions = {
  /** First Line 1 mount: skip opening and start already open. */
  skipOpening?: boolean;
};

export function getTimelinePhase(
  progress: number,
  options: TimelineOptions = {},
): TimelinePhase {
  const { opening, openHold, closing } = heroCarouselConfig.phaseEnds;
  const { skipOpening = false } = options;

  if (!skipOpening && progress < opening) return "opening";
  if (progress < openHold) return "openHold";
  if (progress < closing) return "closing";
  return "closedHold";
}

/** 0 = bars at edges, 1 = bars fully combined in the middle. */
export function getCombineAmount(
  progress: number,
  options: TimelineOptions = {},
): number {
  const { opening, openHold, closing } = heroCarouselConfig.phaseEnds;
  const { skipOpening = false } = options;

  if (!skipOpening && progress < opening) {
    // Start combined (1), open to edges (0)
    return 1 - progress / opening;
  }

  if (progress < openHold) return 0;

  if (progress < closing) {
    return (progress - openHold) / (closing - openHold);
  }

  return 1;
}

export function getPreviousPairIndex(
  pairIndex: number,
  pairCount: number = heroPairs.length,
): number {
  return (pairIndex + pairCount - 1) % pairCount;
}
