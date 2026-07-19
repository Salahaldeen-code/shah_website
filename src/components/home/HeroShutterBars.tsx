"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { heroShutterConfig } from "@/config/carousel";

type SplitAlign = "top" | "bottom";

const ROLL_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

function buildDisplayText() {
  const { marqueeText, marqueeRepeat } = heroShutterConfig;
  return Array.from({ length: marqueeRepeat }, () => marqueeText).join(" ");
}

function countLetters(text: string) {
  let count = 0;
  for (const char of text) {
    if (char !== " ") count += 1;
  }
  return count;
}

function getCycleMs(letterCount: number) {
  const { letterDurationMs, letterStaggerMs, sequencePauseMs } =
    heroShutterConfig;
  if (letterCount <= 0) return letterDurationMs + sequencePauseMs;
  return (
    (letterCount - 1) * letterStaggerMs + letterDurationMs + sequencePauseMs
  );
}

function buildRollKeyframes(letterCount: number, cycleMs: number) {
  const { letterDurationMs, letterStaggerMs, squashScaleY, squashScaleX } =
    heroShutterConfig;
  if (letterCount <= 0 || cycleMs <= 0) return "";

  // Y + scale only — never translateX (parent marquee owns X)
  const normal = `translate3d(0, 0, 0) scale(${1}, ${1})`;
  const midOut = `translate3d(0, 45%, 0) scale(${(1 + squashScaleX) / 2}, ${(1 + squashScaleY) / 2})`;
  const exitSquash = `translate3d(0, 100%, 0) scale(${squashScaleX}, ${squashScaleY})`;
  const enterSquash = `translate3d(0, -100%, 0) scale(${squashScaleX}, ${squashScaleY})`;
  const midIn = `translate3d(0, -45%, 0) scale(${(1 + squashScaleX) / 2}, ${(1 + squashScaleY) / 2})`;

  const parts: string[] = [];
  for (let i = 0; i < letterCount; i += 1) {
    const startMs = i * letterStaggerMs;
    const endMs = startMs + letterDurationMs;
    const midMs = startMs + letterDurationMs * 0.45;

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

const DISPLAY_TEXT = buildDisplayText();
const LETTER_COUNT = countLetters(DISPLAY_TEXT);
const CYCLE_MS = getCycleMs(LETTER_COUNT);
/** Built once — never re-injected on progress ticks. */
const ROLL_KEYFRAMES_CSS = buildRollKeyframes(LETTER_COUNT, CYCLE_MS);

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

function RollingText({
  text,
  animate,
  cycleMs,
}: {
  text: string;
  animate: boolean;
  cycleMs: number;
}) {
  const { letterSpacingEm, squashScaleX } = heroShutterConfig;

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
              style={{ width: `${0.35 + letterSpacingEm}em` }}
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
              marginRight: `${letterSpacingEm}em`,
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

function MarqueeRollingLine({
  text,
  animate,
  cycleMs,
}: {
  text: string;
  animate: boolean;
  cycleMs: number;
}) {
  const { fontSizeScale, marqueeDurationSec } = heroShutterConfig;

  const rootStyle: CSSProperties = {
    fontSize: `calc(var(--shutter-bar-height) * ${fontSizeScale})`,
    ...(animate
      ? ({
          "--shutter-marquee-duration": `${marqueeDurationSec}s`,
        } as CSSProperties)
      : undefined),
  };

  return (
    <div style={rootStyle}>
      {animate ? (
        <div className="shutter-marquee-track flex w-max will-change-transform">
          <RollingText text={text} animate cycleMs={cycleMs} />
          <RollingText text={text} animate cycleMs={cycleMs} />
        </div>
      ) : (
        <RollingText text={text} animate={false} cycleMs={cycleMs} />
      )}
    </div>
  );
}

function SplitRollingText({
  align,
  text,
  animate,
  cycleMs,
}: {
  align: SplitAlign;
  text: string;
  animate: boolean;
  cycleMs: number;
}) {
  const alignClass =
    align === "top"
      ? "absolute bottom-0 left-0 translate-y-1/2"
      : "absolute top-0 left-0 -translate-y-1/2";

  return (
    <div className={alignClass}>
      <MarqueeRollingLine text={text} animate={animate} cycleMs={cycleMs} />
    </div>
  );
}

/**
 * Bars read --shutter-combine / --hero-height / --shutter-bar-height from the hero.
 * No per-frame props — avoids remounts and style thrashing.
 */
export function HeroShutterBars() {
  const reducedMotion = usePrefersReducedMotion();
  const animate = !reducedMotion && LETTER_COUNT > 0;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden="true"
    >
      {animate ? <style>{ROLL_KEYFRAMES_CSS}</style> : null}

      <div className="shutter-bar-top absolute inset-x-0 top-0 h-[var(--shutter-bar-height)] overflow-hidden bg-brand-yellow will-change-transform">
        <SplitRollingText
          align="top"
          text={DISPLAY_TEXT}
          animate={animate}
          cycleMs={CYCLE_MS}
        />
        {heroShutterConfig.accentText ? (
          <span className="absolute bottom-3 left-1/2 z-[1] -translate-x-1/2 font-display text-xs tracking-[0.2em] text-black uppercase sm:text-sm">
            {heroShutterConfig.accentText}
          </span>
        ) : null}
      </div>

      <div className="shutter-bar-bottom absolute inset-x-0 bottom-0 h-[var(--shutter-bar-height)] overflow-hidden bg-brand-yellow will-change-transform">
        <SplitRollingText
          align="bottom"
          text={DISPLAY_TEXT}
          animate={animate}
          cycleMs={CYCLE_MS}
        />
      </div>
    </div>
  );
}
