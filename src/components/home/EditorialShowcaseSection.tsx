"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

import { editorialShowcaseConfig } from "@/config/editorialShowcase";

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

function EditorialRope({ animate }: { animate: boolean }) {
  const { rope, colors } = editorialShowcaseConfig;
  const { pathD, viewBox, loopWidth, durationSec, strokeWidth } = rope;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
    >
      <svg
        className={`editorial-rope-svg h-full min-h-[22rem] w-[200%] sm:min-h-[28rem] md:min-h-[32rem] ${
          animate ? "editorial-rope-track" : ""
        }`}
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        style={
          animate
            ? ({
                "--editorial-rope-duration": `${durationSec}s`,
              } as CSSProperties)
            : undefined
        }
      >
        <g fill="none" stroke={colors.rope} strokeLinecap="round">
          <path
            d={pathD}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={pathD}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
            transform={`translate(${loopWidth}, 0)`}
          />
        </g>
      </svg>
    </div>
  );
}

type StepLevel = {
  key: string;
  text: string;
  stepClass: string;
  /** Build order: 0 = bottom (first), 2 = top (last) */
  buildIndex: number;
};

export function EditorialShowcaseSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hasTriggeredRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const [revealed, setRevealed] = useState(false);

  const {
    topText,
    middleText,
    bottomText,
    overlayText,
    colors,
    scrollAnimation,
    stepWidths,
  } = editorialShowcaseConfig;

  useEffect(() => {
    if (reducedMotion) return;

    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry?.isIntersecting &&
          entry.intersectionRatio >= scrollAnimation.visibilityThreshold &&
          !hasTriggeredRef.current
        ) {
          hasTriggeredRef.current = true;
          setRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold: [0, scrollAnimation.visibilityThreshold, 0.5],
        rootMargin: "0px 0px -8% 0px",
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion, scrollAnimation.visibilityThreshold]);

  const isVisible = revealed || reducedMotion;
  const ropeAnimates = !reducedMotion;

  const {
    blockDurationMs,
    textDurationMs,
    levelStaggerMs,
    textAfterBlockMs,
    overlayDelayMs,
    overlayDurationMs,
  } = scrollAnimation;

  // Overlay starts after top level (buildIndex 2) text begins
  const overlayStartMs =
    levelStaggerMs * 2 + textAfterBlockMs + overlayDelayMs;

  const sectionStyle = {
    "--editorial-bg": colors.background,
    "--editorial-shape": colors.shape,
    "--editorial-text": colors.text,
    "--editorial-overlay": colors.overlay,
    "--editorial-block-duration": `${blockDurationMs}ms`,
    "--editorial-text-duration": `${textDurationMs}ms`,
    "--editorial-level-stagger": `${levelStaggerMs}ms`,
    "--editorial-text-after-block": `${textAfterBlockMs}ms`,
    "--editorial-overlay-delay": `${overlayStartMs}ms`,
    "--editorial-overlay-duration": `${overlayDurationMs}ms`,
    "--editorial-step-top": `${stepWidths.top * 100}%`,
    "--editorial-step-middle": `${stepWidths.middle * 100}%`,
    "--editorial-step-bottom": `${stepWidths.bottom * 100}%`,
    backgroundColor: colors.background,
  } as CSSProperties;

  // Visual order top → middle → bottom; buildIndex drives bottom-first animation
  const levels: StepLevel[] = [
    {
      key: "top",
      text: topText,
      stepClass: "editorial-step-top",
      buildIndex: 2,
    },
    {
      key: "middle",
      text: middleText,
      stepClass: "editorial-step-middle",
      buildIndex: 1,
    },
    {
      key: "bottom",
      text: bottomText,
      stepClass: "editorial-step-bottom",
      buildIndex: 0,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="editorial-showcase"
      aria-labelledby="editorial-showcase-heading"
      className={`editorial-showcase relative overflow-clip py-14 sm:py-20 md:py-24 lg:py-28 ${
        isVisible ? "editorial-showcase--revealed" : ""
      }`}
      style={sectionStyle}
    >
      <EditorialRope animate={ropeAnimates} />

      <div className="relative z-10 mx-auto flex min-h-[min(78vh,46rem)] w-full max-w-[90rem] flex-col items-center justify-center px-[var(--container-padding)]">
        <div className="relative w-full max-w-[min(100%,56rem)] sm:max-w-[min(100%,64rem)] md:max-w-[min(100%,72rem)]">
          <h2 id="editorial-showcase-heading" className="sr-only">
            {topText} {middleText} {bottomText}
          </h2>

          <div className="flex flex-col items-center">
            {levels.map(({ key, text, stepClass, buildIndex }, visualIndex) => (
              <div
                key={key}
                className={`editorial-step-clip ${stepClass} ${
                  visualIndex > 0 ? "-mt-[2px]" : ""
                }`}
              >
                <div
                  className={`editorial-block editorial-block-${buildIndex} flex items-center justify-center overflow-clip rounded-[1.35rem] bg-[var(--editorial-shape)] px-3 py-1.5 sm:rounded-[1.75rem] sm:px-4 sm:py-2 md:rounded-[2.25rem] md:px-5 md:py-2.5 lg:rounded-[2.75rem]`}
                >
                  <span
                    className={`editorial-row editorial-row-${buildIndex} block w-full text-center font-display text-[clamp(2.75rem,13.5vw,7.25rem)] leading-[0.78] tracking-[0.01em] text-[var(--editorial-text)] uppercase`}
                  >
                    {text}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div
            className="editorial-overlay-wrap pointer-events-none absolute left-1/2 top-[46%] z-20 w-[min(120%,26rem)] -translate-x-1/2 -translate-y-1/2 sm:w-[min(118%,34rem)] md:w-[min(115%,42rem)] lg:w-[min(112%,48rem)]"
            aria-hidden="true"
          >
            <p className="editorial-overlay -rotate-[4deg] text-center font-[family-name:var(--font-script)] text-[clamp(1.75rem,6.5vw,3.5rem)] leading-none tracking-wide text-[var(--editorial-overlay)] uppercase">
              {overlayText}
            </p>
          </div>
          <span className="sr-only">{overlayText}</span>
        </div>
      </div>
    </section>
  );
}
