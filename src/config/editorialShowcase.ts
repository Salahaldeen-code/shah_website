/**
 * Editorial stepped showcase — text, colors, scroll timing, and rope SVG.
 * Edit this file to change copy and motion without touching components.
 */
export const editorialShowcaseConfig = {
  topText: "TRAIN",
  middleText: "COMPETE",
  bottomText: "EVOLVE",
  overlayText: "Push forward",

  colors: {
    /** Section background */
    background: "#050505",
    /** Stepped block fill */
    shape: "#f5c518",
    /** Main headline text inside blocks */
    text: "#0a0a0a",
    /** Handwritten overlay */
    overlay: "#ffffff",
    /** Flowing rope stroke */
    rope: "#f5c518",
  },

  /**
   * One-time scroll reveal (first viewport entry per page load).
   * Sequence builds bottom → middle → top, then overlay.
   */
  scrollAnimation: {
    /** Duration of each yellow block rise/reveal in ms */
    blockDurationMs: 780,
    /** Duration of each text reveal in ms */
    textDurationMs: 620,
    /** Delay between consecutive levels (bottom → middle → top) in ms */
    levelStaggerMs: 220,
    /** Delay after a block starts before its text reveals in ms */
    textAfterBlockMs: 160,
    /** Delay after the last text starts before overlay appears in ms */
    overlayDelayMs: 280,
    /** Overlay fade/slide duration in ms */
    overlayDurationMs: 700,
    /** IntersectionObserver ratio before triggering (0–1) */
    visibilityThreshold: 0.2,
  },

  /** Continuous rope loop behind the shape. */
  rope: {
    /** Full horizontal loop duration in seconds (higher = slower) */
    durationSec: 36,
    strokeWidth: 2.25,
    /**
     * SVG path in viewBox coordinates (0 0 1400 520).
     * Enters upper-left, wraps left side, exits lower-right.
     * Duplicate is offset by loopWidth for seamless drift.
     */
    pathD:
      "M -120 80 C 60 -20, 140 280, 220 200 S 280 40, 340 160 S 400 420, 520 300 S 680 80, 780 220 S 900 420, 1040 280 S 1180 80, 1320 200 S 1450 360, 1520 300",
    viewBox: "0 0 1400 520",
    /** Horizontal offset between duplicated paths for seamless loop */
    loopWidth: 1400,
  },

  /**
   * Stepped block width ratios relative to the shape container.
   * Top ≪ middle ≪ bottom for a strong podium silhouette.
   */
  stepWidths: {
    top: 0.4,
    middle: 0.62,
    bottom: 0.92,
  },
} as const;
