export type HeroSlide = {
  id: string;
  /** Still image, or poster/fallback when a video is set. */
  src: string;
  alt: string;
  /**
   * Local MP4 under /public (e.g. /videos/activities/outdoor.mp4).
   * When set, the active slide plays this muted looping video.
   */
  video?: string;
  /**
   * YouTube video id (e.g. from youtu.be/VIDEO_ID).
   * Temporary: used when we want the same hosted clip on every video slide.
   */
  youtubeId?: string;
};

/** Temporary: same YouTube clip on all three hero video slides. */
export const heroYoutubeVideoId = "L3374C3OyrY";

/**
 * Hero carousel — photos are local; video slides temporarily share one YouTube clip.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "slide-1",
    src: "/images/hero/image1.jpg",
    alt: "Hero slide 1",
  },
  {
    id: "slide-2",
    src: `https://img.youtube.com/vi/${heroYoutubeVideoId}/hqdefault.jpg`,
    alt: "Hero video slide 2",
    youtubeId: heroYoutubeVideoId,
  },
  {
    id: "slide-3",
    src: "/images/hero/image3.jpg",
    alt: "Hero slide 3",
  },
  {
    id: "slide-4",
    src: `https://img.youtube.com/vi/${heroYoutubeVideoId}/hqdefault.jpg`,
    alt: "Hero video slide 4",
    youtubeId: heroYoutubeVideoId,
  },
  {
    id: "slide-5",
    src: "/images/hero/image5.jpg",
    alt: "Hero slide 5",
  },
  {
    id: "slide-6",
    src: `https://img.youtube.com/vi/${heroYoutubeVideoId}/hqdefault.jpg`,
    alt: "Hero video slide 6",
    youtubeId: heroYoutubeVideoId,
  },
];

/**
 * Each admin slide → one progress indicator.
 * Cycle: still image first, then video (uploaded preferred over YouTube) if set.
 */
export function buildHeroSlideCycles(slides: readonly HeroSlide[]): {
  slides: HeroSlide[];
  pairs: [number, number][];
  labels: string[];
} {
  const expanded: HeroSlide[] = [];
  const pairs: [number, number][] = [];
  const labels: string[] = [];

  for (const slide of slides) {
    const hasUploadedVideo = Boolean(slide.video);
    const hasYoutube = Boolean(slide.youtubeId);
    const hasVideo = hasUploadedVideo || hasYoutube;

    const imageOnly: HeroSlide = {
      id: `${slide.id}-image`,
      src: slide.src,
      alt: slide.alt,
    };

    const a = expanded.length;
    expanded.push(imageOnly);

    if (hasVideo) {
      const videoSlide: HeroSlide = {
        id: `${slide.id}-video`,
        src: slide.src,
        alt: slide.alt,
        ...(hasUploadedVideo
          ? { video: slide.video }
          : { youtubeId: slide.youtubeId }),
      };
      const b = expanded.length;
      expanded.push(videoSlide);
      pairs.push([a, b]);
    } else {
      // No video — full shutter cycle stays on the still
      const b = expanded.length;
      expanded.push({ ...imageOnly, id: `${slide.id}-image-b` });
      pairs.push([a, b]);
    }

    labels.push(slide.alt);
  }

  return { slides: expanded, pairs, labels };
}

/** @deprecated Prefer buildHeroSlideCycles — kept for static fallback pair helpers. */
export function buildHeroPairs(slideCount: number): [number, number][] {
  return buildHeroSlideCycles(
    Array.from({ length: slideCount }, (_, i) => ({
      id: `placeholder-${i}`,
      src: "",
      alt: `Slide ${i + 1}`,
    })),
  ).pairs;
}

/** Each progress line maps to one content slide (image → video within the cycle). */
export const heroPairs: readonly [number, number][] = buildHeroSlideCycles(
  heroSlides,
).pairs;

/**
 * Continuous pair timeline (progress never pauses).
 * Pattern: open at start (except first Line 1) → hold open to midpoint → close → hold closed.
 */
export const heroCarouselConfig = {
  /** Uninterrupted fill duration for one progress line. */
  pairCycleMs: 10000,
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
  /** How many times to repeat a short brand mark in one marquee unit. */
  marqueeRepeat: 8,
  /** Full horizontal marquee loop duration in seconds (short titles). */
  marqueeDurationSec: 16,
  /** Glyph height as multiplier of --shutter-bar-height (short titles). */
  fontSizeScale: 1.55,
  /** Letter spacing in em (short titles). */
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

/** Adaptive shutter typography / motion for short marks vs long phrases. */
export type ShutterTitleLayout = {
  mode: "mark" | "phrase";
  fontSizeScale: number;
  letterSpacingEm: number;
  wordSpacingEm: number;
  /** Copies of the title inside one seamless marquee half. */
  repeat: number;
  marqueeDurationSec: number;
  useLetterRoll: boolean;
  /** Delay between consecutive letter rolls in ms. */
  letterStaggerMs: number;
  /** Duration of one letter's vertical roll in ms. */
  letterDurationMs: number;
  /** Pause after the last letter before the sequence restarts in ms. */
  sequencePauseMs: number;
  /** Horizontal squash at flip edges (1 = none). */
  squashScaleX: number;
  /** Vertical squash at flip edges (1 = none). */
  squashScaleY: number;
  /** Separator between repeated phrases (phrase mode). */
  separator: string;
};

export function resolveShutterTitleLayout(rawTitle: string): ShutterTitleLayout {
  const title = rawTitle.trim() || heroShutterConfig.marqueeText;
  const length = title.length;

  // Compact brand marks (e.g. PSR) — oversized glyphs + punchy letter rolls
  if (length <= 8) {
    return {
      mode: "mark",
      fontSizeScale: heroShutterConfig.fontSizeScale,
      letterSpacingEm: heroShutterConfig.letterSpacingEm,
      wordSpacingEm: 0,
      repeat: heroShutterConfig.marqueeRepeat,
      marqueeDurationSec: heroShutterConfig.marqueeDurationSec,
      useLetterRoll: true,
      letterStaggerMs: heroShutterConfig.letterStaggerMs,
      letterDurationMs: heroShutterConfig.letterDurationMs,
      sequencePauseMs: heroShutterConfig.sequencePauseMs,
      squashScaleX: heroShutterConfig.squashScaleX,
      squashScaleY: heroShutterConfig.squashScaleY,
      separator: "",
    };
  }

  // Medium / long phrases — marquee only (per-letter flips are too heavy while scrolling)
  if (length <= 24) {
    return {
      mode: "phrase",
      fontSizeScale: 0.72,
      letterSpacingEm: 0.06,
      wordSpacingEm: 0.12,
      repeat: 1,
      marqueeDurationSec: 28,
      useLetterRoll: false,
      letterStaggerMs: 140,
      letterDurationMs: 920,
      sequencePauseMs: 1100,
      squashScaleX: 1,
      squashScaleY: 1,
      separator: "  ·  ",
    };
  }

  return {
    mode: "phrase",
    fontSizeScale: length > 48 ? 0.4 : 0.48,
    letterSpacingEm: 0.035,
    wordSpacingEm: 0.16,
    repeat: 1,
    marqueeDurationSec: 36,
    useLetterRoll: false,
    letterStaggerMs: 110,
    letterDurationMs: 980,
    sequencePauseMs: 1400,
    squashScaleX: 1,
    squashScaleY: 1,
    separator: "  ·  ",
  };
}

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
