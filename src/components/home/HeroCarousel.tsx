"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { CarouselIndicators } from "@/components/home/CarouselIndicators";
import { HeroShutterBars } from "@/components/home/HeroShutterBars";
import {
  getCombineAmount,
  getPreviousPairIndex,
  getTimelinePhase,
  heroCarouselConfig,
  heroPairs,
  heroSlides,
  type HeroSlide,
  type TimelinePhase,
} from "@/config/carousel";

type HeroCarouselProps = {
  slides?: HeroSlide[];
  labels: {
    carousel: string;
    slideStatus: string;
  };
};

function formatSlideStatus(template: string, current: number, total: number) {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
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

function preloadImage(src: string) {
  if (typeof window === "undefined") return Promise.resolve();
  const image = new window.Image();
  image.src = src;
  if (typeof image.decode === "function") {
    return image.decode().catch(() => undefined);
  }
  return new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => resolve();
  });
}

function SlideLayer({
  slide,
  priority,
  clip,
  className = "",
}: {
  slide: HeroSlide;
  priority?: boolean;
  /** When true, reveal via transform portal synced to shutter bars. */
  clip?: boolean;
  className?: string;
}) {
  const media = (
    <>
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/25 to-brand-red/20" />
    </>
  );

  if (clip) {
    return (
      <div className={`shutter-center-portal ${className}`}>
        <div className="shutter-center-portal-media relative">{media}</div>
      </div>
    );
  }

  return <div className={`absolute inset-0 ${className}`}>{media}</div>;
}

type ShutterSlides = {
  outside: HeroSlide;
  center: HeroSlide;
};

/**
 * Always dual layers for the motion path so we never remount single↔dual
 * at phase edges (that remount was causing start/end lag on mobile).
 */
function getShutterSlides(
  phase: TimelinePhase,
  imageA: HeroSlide,
  imageB: HeroSlide,
  imagePrev: HeroSlide,
): ShutterSlides {
  if (phase === "opening") {
    return { outside: imagePrev, center: imageA };
  }
  // openHold / closing / closedHold: B stays outside (under bars or beside banner)
  return { outside: imageB, center: imageA };
}

function applyHeroGeometry(el: HTMLElement) {
  const height = el.clientHeight;
  if (height <= 0) return;
  el.style.setProperty("--hero-height", `${height}px`);
}

export function HeroCarousel({
  slides = heroSlides,
  labels,
}: HeroCarouselProps) {
  const pairCount = heroPairs.length;
  const [pairIndex, setPairIndex] = useState(0);
  const [phase, setPhase] = useState<TimelinePhase>("openHold");
  const [progress, setProgress] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [hasLooped, setHasLooped] = useState(false);

  const heroRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const cycleIdRef = useRef(0);
  const preloadedCloseRef = useRef<number | null>(null);
  const preloadedOpenRef = useRef<number | null>(null);
  const phaseRef = useRef<TimelinePhase>("openHold");
  const skipOpeningRef = useRef(true);
  const reducedMotion = usePrefersReducedMotion();

  const skipOpening = pairIndex === 0 && !hasLooped;

  useEffect(() => {
    skipOpeningRef.current = skipOpening;
  }, [skipOpening]);

  const pair = heroPairs[pairIndex] ?? [0, 0];
  const prevPairIndex = getPreviousPairIndex(pairIndex, pairCount);
  const prevPair = heroPairs[prevPairIndex] ?? [0, 0];

  const imageA = slides[pair[0]];
  const imageB = slides[pair[1]];
  const imagePrev = slides[prevPair[1]];

  const shutterSlides =
    imageA && imageB && imagePrev
      ? getShutterSlides(phase, imageA, imageB, imagePrev)
      : null;

  const resolvedActiveIndex = phase === "closedHold" ? pair[1] : pair[0];

  const writeMotionVars = useCallback(
    (ratio: number, combine: number) => {
      const el = heroRef.current;
      if (!el) return;
      el.style.setProperty("--shutter-combine", String(combine));
      el.style.setProperty("--carousel-progress", String(ratio));
    },
    [],
  );

  const clearFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const advancePair = useCallback(
    (fromIndex: number) => {
      const next = (fromIndex + 1) % pairCount;
      if (fromIndex === pairCount - 1 && next === 0) {
        setHasLooped(true);
      }
      // Always open at line start after the first mount (skipOpening only once)
      phaseRef.current = "opening";
      setPhase("opening");
      writeMotionVars(0, 1);
      setPairIndex(next);
      setProgress(0);
      setRestartKey((key) => key + 1);
    },
    [pairCount, writeMotionVars],
  );

  const goToPair = useCallback(
    (nextPair: number) => {
      if (pairCount === 0) return;
      const next = ((nextPair % pairCount) + pairCount) % pairCount;
      cycleIdRef.current += 1;
      clearFrame();
      preloadedCloseRef.current = null;
      preloadedOpenRef.current = null;
      const wrappingToFirst = pairIndex === pairCount - 1 && next === 0;
      if (wrappingToFirst) {
        setHasLooped(true);
      }
      // Match skipOpening: first line only before any full loop
      const skip = next === 0 && !hasLooped && !wrappingToFirst;
      const nextPhase: TimelinePhase = skip ? "openHold" : "opening";
      const nextCombine = skip ? 0 : 1;
      phaseRef.current = nextPhase;
      setPhase(nextPhase);
      writeMotionVars(0, nextCombine);
      setPairIndex(next);
      setProgress(0);
      setRestartKey((key) => key + 1);
    },
    [clearFrame, hasLooped, pairCount, pairIndex, writeMotionVars],
  );

  // Stable container geometry — resize only, never resets the cycle
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    applyHeroGeometry(el);

    const observer = new ResizeObserver(() => {
      applyHeroGeometry(el);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (pairCount === 0) return;

    clearFrame();
    const cycleId = cycleIdRef.current;
    const currentPair = pairIndex;
    startedAtRef.current = performance.now();
    preloadedCloseRef.current = null;
    preloadedOpenRef.current = null;

    const options = { skipOpening: skipOpeningRef.current };
    const initialCombine = reducedMotion
      ? 0
      : getCombineAmount(0, options);
    const initialPhase = getTimelinePhase(0, options);
    phaseRef.current = initialPhase;
    setPhase(initialPhase);
    writeMotionVars(0, initialCombine);

    const tick = (now: number) => {
      if (cycleId !== cycleIdRef.current) return;

      const elapsed = now - startedAtRef.current;
      const ratio = Math.min(elapsed / heroCarouselConfig.pairCycleMs, 1);
      const opts = { skipOpening: skipOpeningRef.current };
      const combine = reducedMotion ? 0 : getCombineAmount(ratio, opts);
      const nextPhase = getTimelinePhase(ratio, opts);

      writeMotionVars(ratio, combine);

      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }

      if (reducedMotion) {
        setProgress(ratio);
      }

      const { openHold, closing } = heroCarouselConfig.phaseEnds;

      if (
        !reducedMotion &&
        preloadedCloseRef.current !== currentPair &&
        ratio >= openHold * 0.85
      ) {
        const pairSlides = heroPairs[currentPair];
        const b = pairSlides ? slides[pairSlides[1]] : undefined;
        if (b?.src) {
          preloadedCloseRef.current = currentPair;
          void preloadImage(b.src);
        }
      }

      if (
        !reducedMotion &&
        preloadedOpenRef.current !== currentPair &&
        ratio >= closing
      ) {
        const nextPair = heroPairs[(currentPair + 1) % pairCount];
        const nextA = nextPair ? slides[nextPair[0]] : undefined;
        if (nextA?.src) {
          preloadedOpenRef.current = currentPair;
          void preloadImage(nextA.src);
        }
      }

      if (ratio >= 1) {
        cycleIdRef.current += 1;
        advancePair(currentPair);
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return clearFrame;
  }, [
    advancePair,
    clearFrame,
    pairCount,
    pairIndex,
    reducedMotion,
    restartKey,
    slides,
    writeMotionVars,
  ]);

  if (
    slides.length === 0 ||
    pairCount === 0 ||
    !imageA ||
    !imageB ||
    !imagePrev ||
    !shutterSlides
  ) {
    return null;
  }

  const statusIndex = resolvedActiveIndex;

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      className="hero-shutter-root relative h-[100svh] min-h-[28rem] w-full touch-pan-y overflow-hidden bg-brand-dark"
      onTouchStart={(event) => {
        touchStartX.current = event.changedTouches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;

        if (startX == null || endX == null) return;

        const delta = endX - startX;
        if (Math.abs(delta) < heroCarouselConfig.swipeThresholdPx) return;

        if (delta < 0) {
          goToPair(pairIndex + 1);
        } else {
          goToPair(pairIndex - 1);
        }
      }}
    >
      <div className="absolute inset-0">
        {reducedMotion ? (
          <>
            <SlideLayer
              key={imageA.id}
              slide={imageA}
              priority={pairIndex === 0}
              className={`transition-opacity duration-500 ease-out ${
                progress < heroCarouselConfig.midpoint
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
            <SlideLayer
              key={imageB.id}
              slide={imageB}
              priority
              className={`transition-opacity duration-500 ease-out ${
                progress >= heroCarouselConfig.midpoint
                  ? "opacity-100"
                  : "opacity-0"
              }`}
            />
          </>
        ) : (
          <>
            {/* Stable keys: portal DOM must not remount at phase edges */}
            <SlideLayer
              key="shutter-outside"
              slide={shutterSlides.outside}
              priority
              className="z-0"
            />
            <SlideLayer
              key="shutter-center"
              slide={shutterSlides.center}
              priority={pairIndex === 0}
              clip
              className="z-[1]"
            />
          </>
        )}
      </div>

      {!reducedMotion ? <HeroShutterBars /> : null}

      <p className="sr-only" aria-live="polite">
        {formatSlideStatus(
          labels.slideStatus,
          statusIndex + 1,
          slides.length,
        )}
      </p>

      <CarouselIndicators
        count={pairCount}
        activeIndex={pairIndex}
        onSelect={goToPair}
        labels={heroPairs.map(([first], index) => {
          const slide = slides[first];
          return slide?.alt ?? `Group ${index + 1}`;
        })}
      />
    </section>
  );
}
