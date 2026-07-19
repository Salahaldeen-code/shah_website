"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { UpcomingProgramsTable } from "@/components/home/UpcomingProgramsTable";
import type { Locale } from "@/config/i18n";
import { impactImages } from "@/config/impact";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ScrollImpactSectionProps = {
  copy: Dictionary["impact"];
  programsCopy: Dictionary["programs"];
  locale: Locale;
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

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function range(progress: number, edge0: number, edge1: number) {
  return clamp((progress - edge0) / Math.max(0.0001, edge1 - edge0));
}

/** Ease in-out for slower, softer motion. */
function smooth(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

function FloatingDisk({
  src,
  alt,
  className,
  style,
  sizes,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  sizes: string;
}) {
  return (
    <div
      className={`absolute aspect-square overflow-hidden rounded-full border-[3px] border-brand-dark/90 shadow-[0_18px_50px_rgb(0_0_0/0.35)] ${className ?? ""}`}
      style={style}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
    </div>
  );
}

export function ScrollImpactSection({
  copy,
  programsCopy,
  locale,
}: ScrollImpactSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);
  // Reduced motion: photo + programs docked (no close scrubbing)
  const raw = reducedMotion ? 0.8 : scrollProgress;
  const progress = smooth(raw);

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      setScrollProgress(clamp(-rect.top / total));
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reducedMotion]);

  // Timeline: open story → middle split reveal → programs → close from middle
  const settle = smooth(range(raw, 0, 0.12));
  const stageB = smooth(range(raw, 0.14, 0.34));
  const split = smooth(range(raw, 0.36, 0.55));
  const fullReveal = smooth(range(raw, 0.52, 0.68));
  const programsIn = smooth(range(raw, 0.68, 0.84));
  const closeProgress = smooth(range(raw, 0.84, 1));

  const programsReveal = programsIn * (1 - closeProgress);
  const programsOffset = (1 - programsReveal) * 100;

  // Yellow opacity: fades out for photo, returns for close
  const yellowOpacity = Math.max(1 - fullReveal * 0.96, closeProgress);

  // Stage A: SPORTS hero → Stage B: clear eyebrow above STRONG (no muddy overlap)
  const lineAOpacity = clamp(1 - fullReveal) * (1 - closeProgress);
  const lineAScale = 1 - stageB * 0.78;
  const lineAY = (1 - settle) * 40 + stageB * -36; // vh units applied in transform
  const lineATracking = 0.02 + stageB * 0.22;

  const lineBOpacity = smooth(range(raw, 0.16, 0.3)) * (1 - fullReveal) * (1 - closeProgress * 0.5);
  const lineBScale = 0.52 + stageB * 0.48;
  const lineBY = (1 - stageB) * 18; // vh

  // GO exits as GET lands low-left — reads as “GET STRONG”
  const scriptAOpacity =
    (1 - stageB * 0.95) * (1 - fullReveal) * (1 - closeProgress);
  const scriptBOpacity =
    smooth(range(raw, 0.2, 0.34)) * (1 - fullReveal) * (1 - closeProgress);
  const scriptAY = (1 - settle) * 3 - stageB * 8; // vh
  const scriptBX = -18 + stageB * 4; // %
  const scriptBY = 8 - stageB * 2; // vh

  // Only middle-open: yellow panels peel from center (and shut the same way)
  const isClosing = closeProgress > 0.01;
  const openFromMiddle = isClosing ? 1 - closeProgress : split;
  const leftBand = 50 - openFromMiddle * 40;
  const rightBand = 50 - openFromMiddle * 40;
  const centerBand = 100 - leftBand - rightBand;
  const showSplit =
    isClosing || (split > 0.02 && fullReveal < 0.92);

  // Solid yellow before the middle opens — no stripe reveal
  const showYellowOverlay = !showSplit && yellowOpacity > 0.02;

  // Disks frame the type — stay clear of the word stack
  const leftFloatX = -38 + settle * 8 - progress * 6;
  const leftFloatY = -8 + progress * -6;
  const leftFloatScale = 0.9 + settle * 0.08 + stageB * 0.04;
  const leftFloatOpacity = clamp(
    (0.9 + settle * 0.1 - fullReveal * 0.4) *
      (1 - programsReveal * 0.4) *
      (1 - closeProgress),
  );

  const rightFloatIn = smooth(range(raw, 0.2, 0.36));
  const rightFloatX = 34 - rightFloatIn * 8 - progress * 3;
  const rightFloatY = 22 - rightFloatIn * 6;
  const rightFloatOpacity =
    rightFloatIn *
    (1 - fullReveal * 0.35) *
    (1 - programsReveal * 0.4) *
    (1 - closeProgress);
  const rightFloatScale = 0.78 + rightFloatIn * 0.22;

  const bgScale = 1.12 - openFromMiddle * 0.1;
  const textBlockY = (1 - settle) * 28;

  return (
    <div
      ref={sectionRef}
      aria-labelledby="impact-heading"
      className="relative bg-impact-yellow text-brand-dark"
    >
      {/* Tall track = open → programs → close shutters */}
      <div className="relative h-[640vh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          {/* Background photo */}
          <div
            className="absolute inset-0 z-0"
            style={{
              opacity: Math.max(openFromMiddle, fullReveal),
              transform: `scale(${bgScale})`,
              willChange: "transform, opacity",
            }}
          >
            <Image
              src={impactImages.background.src}
              alt={impactImages.background.alt}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/30"
              style={{
                opacity: fullReveal * 0.22 * (1 - closeProgress),
              }}
            />
          </div>

          {showYellowOverlay && (
            <div
              className="absolute inset-0 z-[1] bg-impact-yellow"
              style={{
                opacity: yellowOpacity,
                willChange: "opacity",
              }}
            />
          )}

          {showSplit && (
            <>
              <div
                className="absolute top-0 bottom-0 left-0 z-[2] bg-impact-yellow"
                style={{
                  width: `${leftBand}%`,
                  opacity: isClosing ? 1 : yellowOpacity * (1 - fullReveal),
                }}
              />
              <div
                className="absolute top-0 right-0 bottom-0 z-[2] bg-impact-yellow"
                style={{
                  width: `${rightBand}%`,
                  opacity: isClosing ? 1 : yellowOpacity * (1 - fullReveal),
                }}
              />
              <div
                className="absolute top-0 bottom-0 z-[1] overflow-hidden"
                style={{ left: `${leftBand}%`, width: `${centerBand}%` }}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={impactImages.background.src}
                    alt=""
                    fill
                    sizes="50vw"
                    className="object-cover object-center"
                    aria-hidden
                  />
                </div>
              </div>
            </>
          )}

          {/* Soft depth on the yellow field */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[3]"
            style={{
              opacity: (1 - fullReveal) * (1 - closeProgress) * 0.7,
              background:
                "radial-gradient(ellipse 70% 55% at 50% 48%, transparent 30%, rgb(0 0 0 / 0.1) 100%)",
            }}
          />

          {/* Typography — clear hierarchy: eyebrow → hero → script accent */}
          <div
            className="absolute inset-0 z-20 flex items-center justify-center overflow-hidden"
            style={{
              transform: `translate3d(0, ${textBlockY}px, 0)`,
              willChange: "transform",
            }}
          >
            <div className="relative flex h-full w-full items-center justify-center">
              <h2 id="impact-heading" className="sr-only">
                {copy.scriptB} {copy.lineB} — {copy.lineA}
              </h2>

              {/* STRONG — hero word */}
              <p
                aria-hidden="true"
                className="absolute inset-x-0 top-1/2 z-[5] -translate-y-1/2 text-center font-display text-[clamp(5.5rem,28vw,22rem)] leading-[0.8] tracking-[-0.03em] text-black uppercase"
                style={{
                  opacity: Math.max(0, lineBOpacity),
                  transform: `translate3d(0, calc(-50% + ${lineBY}vh), 0) scale(${lineBScale})`,
                  willChange: "transform, opacity",
                }}
              >
                {copy.lineB}
              </p>

              {/* SPORTS — starts as hero, settles as spaced eyebrow above STRONG */}
              <p
                aria-hidden="true"
                className="relative z-10 w-full text-center font-display text-[clamp(5rem,26vw,20rem)] leading-[0.84] text-brand-dark uppercase"
                style={{
                  opacity: Math.max(0, lineAOpacity),
                  letterSpacing: `${lineATracking}em`,
                  transform: `translate3d(0, ${lineAY}vh, 0) scale(${lineAScale})`,
                  willChange: "transform, opacity",
                }}
              >
                {copy.lineA}
              </p>

              {/* GO — stage A accent */}
              <p
                aria-hidden="true"
                className="impact-script pointer-events-none absolute top-[46%] left-1/2 z-30 font-script text-[clamp(3.25rem,11vw,7.5rem)] leading-none text-white"
                style={{
                  opacity: Math.max(0, scriptAOpacity),
                  transform: `translate3d(-50%, ${scriptAY}vh, 0) rotate(-12deg)`,
                  willChange: "transform, opacity",
                }}
              >
                {copy.scriptA}
              </p>

              {/* GET — stage B accent, anchored low-left of STRONG */}
              <p
                aria-hidden="true"
                className="impact-script pointer-events-none absolute top-1/2 left-1/2 z-30 font-script text-[clamp(3rem,10vw,6.5rem)] leading-none text-white"
                style={{
                  opacity: Math.max(0, scriptBOpacity),
                  transform: `translate3d(calc(-50% + ${scriptBX}%), calc(-50% + ${scriptBY}vh), 0) rotate(-10deg)`,
                  willChange: "transform, opacity",
                }}
              >
                {copy.scriptB}
              </p>
            </div>
          </div>

          {/* Floating photos — frame the type, sit behind the word stack */}
          <div className="pointer-events-none absolute inset-0 z-[12] overflow-hidden">
            <FloatingDisk
              src={impactImages.floatLeft.src}
              alt={impactImages.floatLeft.alt}
              className="top-[12%] left-0 w-[min(46vw,20rem)] sm:w-[min(38vw,22rem)] md:w-[min(32vw,24rem)]"
              sizes="36vw"
              style={{
                opacity: leftFloatOpacity,
                transform: `translate3d(${leftFloatX}%, ${leftFloatY}%, 0) scale(${leftFloatScale}) rotate(${-18 + progress * 10}deg)`,
                zIndex: 4,
                willChange: "transform, opacity",
              }}
            />
            <FloatingDisk
              src={impactImages.floatRight.src}
              alt={impactImages.floatRight.alt}
              className="top-[58%] right-0 w-[min(42vw,18rem)] sm:w-[min(34vw,20rem)] md:w-[min(28vw,22rem)]"
              sizes="32vw"
              style={{
                opacity: rightFloatOpacity,
                transform: `translate3d(${rightFloatX}%, ${rightFloatY}%, 0) scale(${rightFloatScale}) rotate(${14 - progress * 10}deg)`,
                zIndex: 4,
                willChange: "transform, opacity",
              }}
            />
          </div>

          {/* Upcoming programs — slides up, then down as shutters close */}
          <div
            className="absolute inset-x-0 bottom-0 z-40"
            style={{
              transform: `translate3d(0, ${programsOffset}%, 0)`,
              opacity: programsReveal > 0.02 ? 1 : 0,
              pointerEvents:
                programsReveal > 0.55 && closeProgress < 0.2 ? "auto" : "none",
              willChange: "transform",
            }}
          >
            <UpcomingProgramsTable locale={locale} copy={programsCopy} />
          </div>
        </div>
      </div>
    </div>
  );
}
