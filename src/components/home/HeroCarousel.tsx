"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

import { CarouselIndicators } from "@/components/home/CarouselIndicators";
import {
  getCenterClipPath,
  HeroShutterBars,
  type ShutterLayoutMetrics,
} from "@/components/home/HeroShutterBars";
import {
  getCombineAmount,
  getPreviousPairIndex,
  getTimelinePhase,
  heroCarouselConfig,
  heroPairs,
  heroSlides,
  shutterBarHeightRatio,
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

function getBarHeightRatio() {
  if (typeof window === "undefined") return shutterBarHeightRatio.base;
  if (window.matchMedia("(min-width: 1024px)").matches) {
    return shutterBarHeightRatio.lg;
  }
  if (window.matchMedia("(min-width: 640px)").matches) {
    return shutterBarHeightRatio.sm;
  }
  return shutterBarHeightRatio.base;
}

/** Measure hero box in px so bar travel/clip stay locked (avoids vh vs svh mobile jumps). */
function useShutterLayout(containerRef: RefObject<HTMLElement | null>) {
  const [layout, setLayout] = useState<ShutterLayoutMetrics>({
    heroHeightPx: 0,
    barHeightPx: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const heroHeightPx = el.getBoundingClientRect().height;
      if (heroHeightPx <= 0) return;

      const barHeightPx =
        Math.round(heroHeightPx * getBarHeightRatio() * 100) / 100;

      setLayout((prev) => {
        if (
          Math.abs(prev.heroHeightPx - heroHeightPx) < 0.5 &&
          Math.abs(prev.barHeightPx - barHeightPx) < 0.5
        ) {
          return prev;
        }
        return { heroHeightPx, barHeightPx };
      });
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(el);

    const mediaSm = window.matchMedia("(min-width: 640px)");
    const mediaLg = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = () => measure();
    mediaSm.addEventListener("change", onBreakpoint);
    mediaLg.addEventListener("change", onBreakpoint);

    return () => {
      observer.disconnect();
      mediaSm.removeEventListener("change", onBreakpoint);
      mediaLg.removeEventListener("change", onBreakpoint);
    };
  }, [containerRef]);

  return layout;
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
  clipPath,
  className = "",
}: {
  slide: HeroSlide;
  priority?: boolean;
  clipPath?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={clipPath ? { clipPath } : undefined}
    >
      <Image
        src={slide.src}
        alt={slide.alt}
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/25 to-brand-red/20" />
    </div>
  );
}

type LayerMode =
  | { kind: "single"; slide: HeroSlide }
  | {
      kind: "dual";
      outside: HeroSlide;
      center: HeroSlide;
    };

function getLayerMode(
  phase: TimelinePhase,
  imageA: HeroSlide,
  imageB: HeroSlide,
  imagePrev: HeroSlide,
): LayerMode {
  if (phase === "opening") {
    // Next (A) between bars, previous outside
    return { kind: "dual", outside: imagePrev, center: imageA };
  }
  if (phase === "openHold") {
    return { kind: "single", slide: imageA };
  }
  if (phase === "closing") {
    // Previous (A) between, next (B) outside
    return { kind: "dual", outside: imageB, center: imageA };
  }
  // closedHold
  return { kind: "single", slide: imageB };
}

export function HeroCarousel({
  slides = heroSlides,
  labels,
}: HeroCarouselProps) {
  const pairCount = heroPairs.length;
  const [pairIndex, setPairIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [hasLooped, setHasLooped] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const cycleIdRef = useRef(0);
  const preloadedCloseRef = useRef<number | null>(null);
  const preloadedOpenRef = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const shutterLayout = useShutterLayout(heroRef);

  const skipOpening = pairIndex === 0 && !hasLooped;
  const timelineOptions = { skipOpening };

  const pair = heroPairs[pairIndex] ?? [0, 0];
  const prevPairIndex = getPreviousPairIndex(pairIndex, pairCount);
  const prevPair = heroPairs[prevPairIndex] ?? [0, 0];

  const imageA = slides[pair[0]];
  const imageB = slides[pair[1]];
  const imagePrev = slides[prevPair[1]];

  const combineAmount = reducedMotion
    ? 0
    : getCombineAmount(progress, timelineOptions);
  const phase = getTimelinePhase(progress, timelineOptions);
  const centerClip = getCenterClipPath(combineAmount, shutterLayout);
  const layerMode =
    imageA && imageB && imagePrev
      ? getLayerMode(phase, imageA, imageB, imagePrev)
      : null;

  // Promote active image only after movement completes
  const resolvedActiveIndex = phase === "closedHold" ? pair[1] : pair[0];

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
      setPairIndex(next);
      setProgress(0);
      setRestartKey((key) => key + 1);
    },
    [pairCount],
  );

  const goToPair = useCallback(
    (nextPair: number) => {
      if (pairCount === 0) return;
      const next = ((nextPair % pairCount) + pairCount) % pairCount;
      cycleIdRef.current += 1;
      clearFrame();
      preloadedCloseRef.current = null;
      preloadedOpenRef.current = null;
      if (pairIndex === pairCount - 1 && next === 0) {
        setHasLooped(true);
      }
      setPairIndex(next);
      setProgress(0);
      setRestartKey((key) => key + 1);
    },
    [clearFrame, pairCount, pairIndex],
  );

  useEffect(() => {
    if (pairCount === 0) return;

    clearFrame();
    const cycleId = cycleIdRef.current;
    startedAtRef.current = performance.now();
    preloadedCloseRef.current = null;
    preloadedOpenRef.current = null;

    const tick = (now: number) => {
      if (cycleId !== cycleIdRef.current) return;

      const elapsed = now - startedAtRef.current;
      const ratio = Math.min(elapsed / heroCarouselConfig.pairCycleMs, 1);
      setProgress(ratio);

      const { openHold, closing } = heroCarouselConfig.phaseEnds;

      // Preload B before midpoint close
      if (
        !reducedMotion &&
        preloadedCloseRef.current !== pairIndex &&
        ratio >= openHold * 0.85
      ) {
        if (imageB?.src) {
          preloadedCloseRef.current = pairIndex;
          void preloadImage(imageB.src);
        }
      }

      // Preload next line's A before line ends (for upcoming open)
      if (
        !reducedMotion &&
        preloadedOpenRef.current !== pairIndex &&
        ratio >= closing
      ) {
        const nextPair = heroPairs[(pairIndex + 1) % pairCount];
        const nextA = nextPair ? slides[nextPair[0]] : undefined;
        if (nextA?.src) {
          preloadedOpenRef.current = pairIndex;
          void preloadImage(nextA.src);
        }
      }

      if (ratio >= 1) {
        cycleIdRef.current += 1;
        advancePair(pairIndex);
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return clearFrame;
  }, [
    advancePair,
    clearFrame,
    imageB?.src,
    pairCount,
    pairIndex,
    reducedMotion,
    restartKey,
    slides,
  ]);

  if (
    slides.length === 0 ||
    pairCount === 0 ||
    !imageA ||
    !imageB ||
    !imagePrev ||
    !layerMode
  ) {
    return null;
  }

  const statusIndex = resolvedActiveIndex;

  const heroCssVars: CSSProperties | undefined =
    shutterLayout.heroHeightPx > 0
      ? ({
          "--hero-height": `${shutterLayout.heroHeightPx}px`,
          "--shutter-bar-height": `${shutterLayout.barHeightPx}px`,
        } as CSSProperties)
      : undefined;

  return (
    <section
      ref={heroRef}
      id="hero"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      className="relative h-[100svh] min-h-[28rem] w-full touch-pan-y overflow-hidden bg-brand-dark"
      style={heroCssVars}
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
        ) : layerMode.kind === "single" ? (
          <SlideLayer
            key={layerMode.slide.id}
            slide={layerMode.slide}
            priority={pairIndex === 0 || layerMode.slide.id === imageA.id}
          />
        ) : (
          <>
            {/* Outside stays unclipped; center uses shutter clip */}
            <SlideLayer
              key={layerMode.outside.id}
              slide={layerMode.outside}
              priority
              className="z-0"
            />
            <SlideLayer
              key={layerMode.center.id}
              slide={layerMode.center}
              priority={pairIndex === 0}
              clipPath={centerClip}
              className="z-[1]"
            />
          </>
        )}
      </div>

      {!reducedMotion ? (
        <HeroShutterBars
          combineAmount={combineAmount}
          heroHeightPx={shutterLayout.heroHeightPx}
          barHeightPx={shutterLayout.barHeightPx}
        />
      ) : null}

      <p className="sr-only" aria-live="polite">
        {formatSlideStatus(labels.slideStatus, statusIndex + 1, slides.length)}
      </p>

      <CarouselIndicators
        count={pairCount}
        activeIndex={pairIndex}
        progress={progress}
        onSelect={goToPair}
        labels={heroPairs.map(([first], index) => {
          const slide = slides[first];
          return slide?.alt ?? `Group ${index + 1}`;
        })}
      />
    </section>
  );
}
