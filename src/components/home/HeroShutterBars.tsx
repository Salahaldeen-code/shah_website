"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  heroShutterConfig,
  resolveShutterTitleLayout,
  type ShutterTitleLayout,
} from "@/config/carousel";

type HeroShutterBarsProps = {
  /** 0 = separated at edges, 1 = fully combined in the middle. */
  combineAmount: number;
  /** Measured hero container height in px (0 = use CSS svh fallbacks). */
  heroHeightPx?: number;
  /** Measured bar height in px (0 = use CSS var fallback). */
  barHeightPx?: number;
  /** Word / phrase shown in the yellow shutter bars. */
  title?: string;
};

type SplitAlign = "top" | "bottom";

const ROLL_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
/** Comfortable reading speed for long phrase tickers (px/sec). */
const PHRASE_SCROLL_PX_PER_SEC = 52;
/** Short brand marks can move a bit faster. */
const MARK_SCROLL_PX_PER_SEC = 72;

function countLetters(text: string) {
  let count = 0;
  for (const char of text) {
    if (char !== " ") count += 1;
  }
  return count;
}

function getCycleMs(
  letterCount: number,
  layout: Pick<
    ShutterTitleLayout,
    "letterDurationMs" | "letterStaggerMs" | "sequencePauseMs"
  >,
) {
  const { letterDurationMs, letterStaggerMs, sequencePauseMs } = layout;
  if (letterCount <= 0) return letterDurationMs + sequencePauseMs;
  return (
    (letterCount - 1) * letterStaggerMs + letterDurationMs + sequencePauseMs
  );
}

function buildRollKeyframes(
  letterCount: number,
  cycleMs: number,
  layout: Pick<
    ShutterTitleLayout,
    | "letterDurationMs"
    | "letterStaggerMs"
    | "squashScaleX"
    | "squashScaleY"
    | "mode"
  >,
) {
  const { letterDurationMs, letterStaggerMs, squashScaleX, squashScaleY, mode } =
    layout;
  if (letterCount <= 0 || cycleMs <= 0) return "";

  // Phrase: mostly vertical travel — squash is soft so glyphs don't wobble sideways
  const travelOut = mode === "phrase" ? 38 : 45;
  const travelIn = mode === "phrase" ? 38 : 45;

  const normal = `translate3d(0, 0, 0) scale(1, 1)`;
  const midOut = `translate3d(0, ${travelOut}%, 0) scale(${(1 + squashScaleX) / 2}, ${(1 + squashScaleY) / 2})`;
  const exitSquash = `translate3d(0, 100%, 0) scale(${squashScaleX}, ${squashScaleY})`;
  const enterSquash = `translate3d(0, -100%, 0) scale(${squashScaleX}, ${squashScaleY})`;
  const midIn = `translate3d(0, -${travelIn}%, 0) scale(${(1 + squashScaleX) / 2}, ${(1 + squashScaleY) / 2})`;

  const parts: string[] = [];
  for (let i = 0; i < letterCount; i += 1) {
    const startMs = i * letterStaggerMs;
    const endMs = startMs + letterDurationMs;
    const midMs = startMs + letterDurationMs * (mode === "phrase" ? 0.5 : 0.45);

    const startPct = (startMs / cycleMs) * 100;
    const midPct = (midMs / cycleMs) * 100;
    const endPct = (endMs / cycleMs) * 100;

    parts.push(`@keyframes shutter-letter-out-${i} {
  0%, ${startPct.toFixed(4)}% { transform: ${normal}; }
  ${midPct.toFixed(4)}% { transform: ${midOut}; }
  ${endPct.toFixed(4)}%, 100% { transform: ${exitSquash}; }
}
@keyframes shutter-letter-in-${i} {
  0%, ${startPct.toFixed(4)}% { transform: ${enterSquash}; }
  ${midPct.toFixed(4)}% { transform: ${midIn}; }
  ${endPct.toFixed(4)}%, 100% { transform: ${normal}; }
}`);
  }
  return parts.join("\n");
}

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

function phraseRepeatCount(probeWidthPx: number, minWidthPx: number) {
  if (probeWidthPx <= 0) return 3;
  return Math.max(2, Math.ceil(minWidthPx / probeWidthPx) + 1);
}

function MarkRollingText({
  text,
  animate,
  cycleMs,
  layout,
}: {
  text: string;
  animate: boolean;
  cycleMs: number;
  layout: ShutterTitleLayout;
}) {
  const { squashScaleX } = heroShutterConfig;
  let letterIndex = 0;
  const slotExtra = `${(squashScaleX - 1) * 0.55}em`;

  return (
    <div
      className="flex w-max shrink-0 items-baseline font-display leading-none text-black uppercase"
      aria-hidden="true"
    >
      {[...text].map((char, index) => {
        if (char === " ") {
          return (
            <span
              key={`space-${index}`}
              className="inline-block shrink-0"
              style={{ width: `${0.35 + layout.letterSpacingEm}em` }}
            />
          );
        }

        const rollIndex = letterIndex;
        letterIndex += 1;

        return (
          <span
            key={`letter-${index}`}
            className="relative inline-block h-[1em] shrink-0 overflow-clip leading-none"
            style={{
              marginRight: `${layout.letterSpacingEm}em`,
              width: `calc(0.72em + ${slotExtra})`,
            }}
          >
            {animate ? (
              <>
                <span className="invisible block text-center leading-none">
                  {char}
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center will-change-transform"
                  style={{
                    transformOrigin: "center bottom",
                    animation: `shutter-letter-out-${rollIndex} ${cycleMs}ms ${ROLL_EASING} infinite`,
                  }}
                >
                  {char}
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center will-change-transform"
                  style={{
                    transformOrigin: "center top",
                    animation: `shutter-letter-in-${rollIndex} ${cycleMs}ms ${ROLL_EASING} infinite`,
                  }}
                >
                  {char}
                </span>
              </>
            ) : (
              <span className="block text-center leading-none">{char}</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function PhraseChip({
  text,
  layout,
  animate = false,
}: {
  text: string;
  layout: ShutterTitleLayout;
  animate?: boolean;
}) {
  return (
    <span
      className={`shutter-phrase-chip inline-flex w-max shrink-0 items-center font-display leading-none uppercase ${
        animate ? "shutter-phrase-chip--live" : ""
      }`}
      style={{
        letterSpacing: `${layout.letterSpacingEm}em`,
        wordSpacing: `${layout.wordSpacingEm}em`,
      }}
    >
      <span className="shutter-phrase-text whitespace-nowrap">{text}</span>
      <span className="shutter-phrase-diamond inline-flex shrink-0 select-none items-center justify-center">
        ◆
      </span>
    </span>
  );
}

function PhraseStrip({
  title,
  count,
  layout,
  animate,
}: {
  title: string;
  count: number;
  layout: ShutterTitleLayout;
  animate: boolean;
}) {
  return (
    <div
      className={`shutter-phrase-strip flex w-max shrink-0 items-center ${
        animate ? "shutter-phrase-strip--live" : ""
      }`}
      aria-hidden="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <PhraseChip
          key={index}
          text={title}
          layout={layout}
          animate={animate}
        />
      ))}
    </div>
  );
}

function MarkStrip({
  text,
  animate,
  cycleMs,
  layout,
}: {
  text: string;
  animate: boolean;
  cycleMs: number;
  layout: ShutterTitleLayout;
}) {
  return (
    <MarkRollingText
      text={text}
      animate={animate && layout.useLetterRoll}
      cycleMs={cycleMs}
      layout={layout}
    />
  );
}

function SplitMarquee({
  align,
  layout,
  markText,
  phraseTitle,
  phraseCount,
  animate,
  cycleMs,
  unitRef,
}: {
  align: SplitAlign;
  layout: ShutterTitleLayout;
  markText: string;
  phraseTitle: string;
  phraseCount: number;
  animate: boolean;
  cycleMs: number;
  /** Only the top copy measures — keeps both halves identical width. */
  unitRef?: RefObject<HTMLDivElement | null>;
}) {
  const alignClass =
    align === "top"
      ? "absolute bottom-0 left-0 translate-y-1/2"
      : "absolute top-0 left-0 -translate-y-1/2";

  const fontStyle: CSSProperties = {
    fontSize: `calc(var(--shutter-bar-height) * ${layout.fontSizeScale})`,
  };

  const renderUnit = (ref?: RefObject<HTMLDivElement | null>) => (
    <div ref={ref} className="flex w-max shrink-0 items-center">
      {layout.mode === "mark" ? (
        <MarkStrip
          text={markText}
          animate={animate}
          cycleMs={cycleMs}
          layout={layout}
        />
      ) : (
        <PhraseStrip
          title={phraseTitle}
          count={phraseCount}
          layout={layout}
          animate={animate}
        />
      )}
    </div>
  );

  return (
    <div className={alignClass} style={fontStyle}>
      {animate ? (
        <div className="shutter-marquee-track-synced flex w-max items-center">
          {renderUnit(unitRef)}
          {renderUnit()}
        </div>
      ) : (
        renderUnit()
      )}
    </div>
  );
}

/**
 * Drive a single --shutter-marquee-x on the root so top + bottom bars
 * always share the exact same horizontal offset (no CSS-animation drift).
 */
function useSyncedMarqueeOffset(
  rootRef: RefObject<HTMLDivElement | null>,
  unitRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  pxPerSec: number,
) {
  useEffect(() => {
    if (!enabled) return;

    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    let unitWidth = 0;
    let start = performance.now();
    let lastWidth = 0;

    const measure = () => {
      const next = unitRef.current?.offsetWidth ?? 0;
      if (next > 0 && next !== lastWidth) {
        lastWidth = next;
        unitWidth = next;
        start = performance.now();
      }
    };

    measure();

    const tick = (now: number) => {
      measure();
      if (unitWidth > 0) {
        const durationMs = (unitWidth / pxPerSec) * 1000;
        const progress = ((now - start) % durationMs) / durationMs;
        const x = Math.round(-progress * unitWidth);
        root.style.setProperty("--shutter-marquee-x", `${x}px`);
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    const onResize = () => {
      lastWidth = 0;
      measure();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      root.style.removeProperty("--shutter-marquee-x");
    };
  }, [enabled, pxPerSec, rootRef, unitRef]);
}

export function HeroShutterBars({
  combineAmount,
  heroHeightPx = 0,
  barHeightPx = 0,
  title = heroShutterConfig.marqueeText,
}: HeroShutterBarsProps) {
  const t = Math.min(Math.max(combineAmount, 0), 1);
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const unitRef = useRef<HTMLDivElement | null>(null);
  const probeRef = useRef<HTMLDivElement | null>(null);

  const layout = useMemo(() => resolveShutterTitleLayout(title), [title]);
  const rawTitle = title.trim() || heroShutterConfig.marqueeText;
  const markText = useMemo(
    () =>
      layout.mode === "mark"
        ? Array.from({ length: layout.repeat }, () => rawTitle).join(" ")
        : rawTitle,
    [layout.mode, layout.repeat, rawTitle],
  );

  const [probeWidth, setProbeWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const measureProbe = () => {
      setProbeWidth(probeRef.current?.offsetWidth ?? 0);
      setViewportWidth(window.innerWidth);
    };
    measureProbe();
    // Remeasure after fonts/layout settle
    const raf = requestAnimationFrame(measureProbe);
    window.addEventListener("resize", measureProbe);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measureProbe);
    };
  }, [rawTitle, layout]);

  const phraseCount = useMemo(
    () => phraseRepeatCount(probeWidth, Math.max(viewportWidth, 320)),
    [probeWidth, viewportWidth],
  );

  // Keyframes keyed to one phrase (or mark unit) — chips reuse the same indices
  const rollSource =
    layout.mode === "mark" ? markText : rawTitle;
  const rollLetterCount = layout.useLetterRoll ? countLetters(rollSource) : 0;
  const cycleMs = getCycleMs(rollLetterCount, layout);
  const keyframesCss = layout.useLetterRoll
    ? buildRollKeyframes(rollLetterCount, cycleMs, layout)
    : "";
  const animate = !reducedMotion && rawTitle.length > 0;
  const pxPerSec =
    layout.mode === "mark" ? MARK_SCROLL_PX_PER_SEC : PHRASE_SCROLL_PX_PER_SEC;

  useSyncedMarqueeOffset(rootRef, unitRef, animate, pxPerSec);

  const topTransform =
    heroHeightPx > 0 && barHeightPx > 0
      ? `translate3d(0, ${(heroHeightPx / 2 - barHeightPx) * t}px, 0)`
      : `translate3d(0, calc((var(--hero-height) * 0.5 - var(--shutter-bar-height)) * ${t}), 0)`;
  const bottomTransform =
    heroHeightPx > 0 && barHeightPx > 0
      ? `translate3d(0, ${-(heroHeightPx / 2 - barHeightPx) * t}px, 0)`
      : `translate3d(0, calc((var(--shutter-bar-height) - var(--hero-height) * 0.5) * ${t}), 0)`;

  const barStyle =
    barHeightPx > 0
      ? ({ height: barHeightPx, transform: topTransform } as const)
      : ({ transform: topTransform } as const);
  const bottomBarStyle =
    barHeightPx > 0
      ? ({ height: barHeightPx, transform: bottomTransform } as const)
      : ({ transform: bottomTransform } as const);

  const probeStyle: CSSProperties = {
    fontSize: `calc(var(--shutter-bar-height) * ${layout.fontSizeScale})`,
  };

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
      style={{ ["--shutter-marquee-x" as string]: "0px" }}
    >
      {animate && keyframesCss ? <style>{keyframesCss}</style> : null}

      {layout.mode === "phrase" ? (
        <div
          className="pointer-events-none absolute top-0 left-0 -z-10 opacity-0"
          style={probeStyle}
          aria-hidden
        >
          <div ref={probeRef} className="w-max">
            <PhraseChip text={rawTitle} layout={layout} />
          </div>
        </div>
      ) : null}

      <div
        className="absolute inset-x-0 top-0 h-[var(--shutter-bar-height)] overflow-hidden bg-brand-yellow will-change-transform"
        style={barStyle}
      >
        <SplitMarquee
          align="top"
          layout={layout}
          markText={markText}
          phraseTitle={rawTitle}
          phraseCount={phraseCount}
          animate={animate}
          cycleMs={cycleMs}
          unitRef={unitRef}
        />
        {heroShutterConfig.accentText ? (
          <span className="absolute bottom-3 left-1/2 z-[1] -translate-x-1/2 font-display text-xs tracking-[0.2em] text-black uppercase sm:text-sm">
            {heroShutterConfig.accentText}
          </span>
        ) : null}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-[var(--shutter-bar-height)] overflow-hidden bg-brand-yellow will-change-transform"
        style={bottomBarStyle}
      >
        <SplitMarquee
          align="bottom"
          layout={layout}
          markText={markText}
          phraseTitle={rawTitle}
          phraseCount={phraseCount}
          animate={animate}
          cycleMs={cycleMs}
        />
      </div>
    </div>
  );
}

export type ShutterLayoutMetrics = {
  heroHeightPx: number;
  barHeightPx: number;
};

/**
 * Center gap clip matching bar positions.
 * Uses the same pixel metrics as bar transforms so clips stay locked on mobile.
 */
export function getCenterClipPath(
  combineAmount: number,
  layout?: ShutterLayoutMetrics,
): string {
  const t = Math.min(Math.max(combineAmount, 0), 1);

  if (layout && layout.heroHeightPx > 0 && layout.barHeightPx > 0) {
    const travel = layout.heroHeightPx / 2 - layout.barHeightPx;
    const inset = layout.barHeightPx + travel * t;
    return `inset(${inset}px 0 ${inset}px 0)`;
  }

  const topInset = `calc(var(--shutter-bar-height) + (var(--hero-height) * 0.5 - var(--shutter-bar-height)) * ${t})`;
  const bottomInset = `calc(var(--shutter-bar-height) + (var(--hero-height) * 0.5 - var(--shutter-bar-height)) * ${t})`;
  return `inset(${topInset} 0 ${bottomInset} 0)`;
}
