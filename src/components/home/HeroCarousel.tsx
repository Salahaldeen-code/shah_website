"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
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
  buildHeroSlideCycles,
  getCombineAmount,
  getPreviousPairIndex,
  getTimelinePhase,
  heroCarouselConfig,
  heroShutterConfig,
  heroSlides,
  shutterBarHeightRatio,
  type HeroSlide,
  type TimelinePhase,
} from "@/config/carousel";

type HeroCarouselProps = {
  slides?: HeroSlide[];
  /** Word shown in the yellow shutter bars. */
  title?: string;
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
  if (typeof window === "undefined" || !src) return Promise.resolve();
  const image = new window.Image();
  image.decoding = "async";
  image.src = src;
  if (typeof image.decode === "function") {
    return image.decode().catch(() => undefined);
  }
  return new Promise<void>((resolve) => {
    image.onload = () => resolve();
    image.onerror = () => resolve();
  });
}

function preloadVideo(src: string) {
  if (typeof window === "undefined" || !src) return;
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = src;
  video.load();
}

/** Decode every slide poster (and buffer local videos) before transitions need them. */
function useHeroMediaWarmup(slides: readonly HeroSlide[]) {
  useEffect(() => {
    for (const slide of slides) {
      void preloadImage(slide.src);
      if (slide.video) preloadVideo(slide.video);
    }
  }, [slides]);
}

function youtubeEmbedSrc(videoId: string) {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    controls: "0",
    playsinline: "1",
    loop: "1",
    playlist: videoId,
    rel: "0",
    modestbranding: "1",
    iv_load_policy: "3",
    disablekb: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

function SlideLayer({
  slide,
  priority,
  clipPath,
  className = "",
  playVideo = true,
  visible = true,
}: {
  slide: HeroSlide;
  priority?: boolean;
  clipPath?: string;
  className?: string;
  /** When false, keep media mounted but don't autoplay video/iframe. */
  playVideo?: boolean;
  /** Soft-hide without unmounting so the next frame is already decoded. */
  visible?: boolean;
}) {
  const hasUploadedVideo = Boolean(slide.video);
  const hasYoutube = Boolean(slide.youtubeId) && !hasUploadedVideo;
  const isVideoSlide = hasUploadedVideo || hasYoutube;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const wasReadyRef = useRef(false);
  const activePlayback = playVideo && visible;

  // Only reset when the media source changes — NOT when play/visibility toggles,
  // so YT can stay alive when this layer moves from "B" → "prev".
  useEffect(() => {
    setMediaReady(false);
    wasReadyRef.current = false;
  }, [slide.id, slide.video, slide.youtubeId]);

  useEffect(() => {
    if (mediaReady) wasReadyRef.current = true;
  }, [mediaReady]);

  // Safety: don't stay on black forever
  useEffect(() => {
    if (!activePlayback || !isVideoSlide || mediaReady) return;
    const timer = window.setTimeout(() => setMediaReady(true), 2800);
    return () => window.clearTimeout(timer);
  }, [activePlayback, isVideoSlide, mediaReady, slide.video, slide.youtubeId]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !hasUploadedVideo) return;

    const markReady = () => setMediaReady(true);

    el.addEventListener("canplay", markReady);
    el.addEventListener("playing", markReady);

    if (activePlayback) {
      if (el.readyState >= 3) markReady();
      void el.play().catch(() => undefined);
    } else {
      el.pause();
    }

    return () => {
      el.removeEventListener("canplay", markReady);
      el.removeEventListener("playing", markReady);
    };
  }, [hasUploadedVideo, activePlayback, slide.video]);

  // Image-only slides use the poster. Video slides never fall back to poster
  // after they've played — that was flashing image-1 over the outgoing YT.
  const showPoster = !isVideoSlide;
  const showBlackHold =
    isVideoSlide && visible && !mediaReady && !wasReadyRef.current;
  const showLiveMedia =
    isVideoSlide && visible && (mediaReady || wasReadyRef.current);

  return (
    <div
      className={`absolute inset-0 ${className}`}
      style={{
        ...(clipPath ? { clipPath } : {}),
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? undefined : "none",
      }}
      aria-hidden={visible ? undefined : true}
    >
      <div className="absolute inset-0 overflow-hidden bg-brand-dark">
        {showPoster ? (
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover"
          />
        ) : null}

        {showBlackHold ? (
          <div aria-hidden className="absolute inset-0 bg-brand-dark" />
        ) : null}

        {/* Keep YT mounted for the life of this slide id so handoffs don't remount */}
        {hasYoutube && slide.youtubeId ? (
          <iframe
            title={slide.alt}
            src={youtubeEmbedSrc(slide.youtubeId)}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={false}
            onLoad={() => setMediaReady(true)}
            className={`pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0 transition-opacity duration-500 ease-out ${
              showLiveMedia ? "opacity-100" : "opacity-0"
            }`}
          />
        ) : null}

        {hasUploadedVideo && slide.video ? (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ease-out ${
              showLiveMedia ? "opacity-100" : "opacity-0"
            }`}
            src={slide.video}
            muted
            loop
            playsInline
            preload="auto"
            aria-label={slide.alt}
          />
        ) : null}
      </div>

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
    return { kind: "dual", outside: imagePrev, center: imageA };
  }
  if (phase === "openHold") {
    return { kind: "single", slide: imageA };
  }
  if (phase === "closing") {
    return { kind: "dual", outside: imageB, center: imageA };
  }
  return { kind: "single", slide: imageB };
}

export function HeroCarousel({
  slides = heroSlides,
  title = heroShutterConfig.marqueeText,
  labels,
}: HeroCarouselProps) {
  const cycle = useMemo(() => buildHeroSlideCycles(slides), [slides]);
  const displaySlides = cycle.slides;
  const pairs = cycle.pairs;
  const pairCount = pairs.length;
  const [pairIndex, setPairIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [restartKey, setRestartKey] = useState(0);
  const [hasLooped, setHasLooped] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const cycleIdRef = useRef(0);
  const heroRef = useRef<HTMLElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const shutterLayout = useShutterLayout(heroRef);

  useHeroMediaWarmup(displaySlides);

  const skipOpening = pairIndex === 0 && !hasLooped;
  const timelineOptions = { skipOpening };

  const pair = pairs[pairIndex] ?? [0, 0];
  const prevPairIndex = getPreviousPairIndex(pairIndex, pairCount);
  const prevPair = pairs[prevPairIndex] ?? [0, 0];
  const nextPair = pairs[(pairIndex + 1) % Math.max(pairCount, 1)] ?? [0, 0];

  const imageA = displaySlides[pair[0]];
  const imageB = displaySlides[pair[1]];
  const imagePrev = displaySlides[prevPair[1]];
  const imageNextA = displaySlides[nextPair[0]];

  const combineAmount = reducedMotion
    ? 0
    : getCombineAmount(progress, timelineOptions);
  const phase = getTimelinePhase(progress, timelineOptions);
  const centerClip = getCenterClipPath(combineAmount, shutterLayout);
  const layerMode =
    imageA && imageB && imagePrev
      ? getLayerMode(phase, imageA, imageB, imagePrev)
      : null;

  const resolvedActiveIndex = pairIndex;

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
    (nextPairIndex: number) => {
      if (pairCount === 0) return;
      const next = ((nextPairIndex % pairCount) + pairCount) % pairCount;
      cycleIdRef.current += 1;
      clearFrame();
      if (pairIndex === pairCount - 1 && next === 0) {
        setHasLooped(true);
      }
      setPairIndex(next);
      setProgress(0);
      setRestartKey((key) => key + 1);
    },
    [clearFrame, pairCount, pairIndex],
  );

  // Warm the next cycle as soon as this one starts (not near the end).
  useEffect(() => {
    if (!imageA || !imageB) return;
    void preloadImage(imageA.src);
    void preloadImage(imageB.src);
    if (imageA.video) preloadVideo(imageA.video);
    if (imageB.video) preloadVideo(imageB.video);
    if (imageNextA?.src) void preloadImage(imageNextA.src);
    if (imageNextA?.video) preloadVideo(imageNextA.video);
  }, [imageA, imageB, imageNextA, pairIndex]);

  useEffect(() => {
    if (pairCount === 0) return;

    clearFrame();
    const cycleId = cycleIdRef.current;
    startedAtRef.current = performance.now();

    const tick = (now: number) => {
      if (cycleId !== cycleIdRef.current) return;

      const elapsed = now - startedAtRef.current;
      const ratio = Math.min(elapsed / heroCarouselConfig.pairCycleMs, 1);
      setProgress(ratio);

      if (ratio >= 1) {
        cycleIdRef.current += 1;
        advancePair(pairIndex);
        return;
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return clearFrame;
  }, [advancePair, clearFrame, pairCount, pairIndex, restartKey]);

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
  const showOpening = phase === "opening";
  const showClosing = phase === "closing";
  const showOpenHold = phase === "openHold";
  const showClosedHold = phase === "closedHold";
  const aVisible = showOpening || showOpenHold || showClosing;
  const bVisible = showClosing || showClosedHold;
  const prevVisible = showOpening;
  const aClipped = showOpening || showClosing;

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
              playVideo={false}
              visible={progress < heroCarouselConfig.midpoint}
              className="transition-opacity duration-500 ease-out"
            />
            <SlideLayer
              key={imageB.id}
              slide={imageB}
              priority
              playVideo={false}
              visible={progress >= heroCarouselConfig.midpoint}
              className="transition-opacity duration-500 ease-out"
            />
          </>
        ) : (
          <>
            {/*
              Stable keys by slide.id so the outgoing YT layer is reused as "prev"
              (not remounted → no flash back to image poster).
            */}
            {imageNextA &&
            imageNextA.id !== imageA.id &&
            imageNextA.id !== imageB.id &&
            imageNextA.id !== imagePrev.id ? (
              <SlideLayer
                key={imageNextA.id}
                slide={imageNextA}
                playVideo={false}
                visible={false}
                className="z-[-1]"
              />
            ) : null}
            <SlideLayer
              key={imagePrev.id}
              slide={imagePrev}
              playVideo={prevVisible}
              visible={prevVisible}
              className="z-0"
            />
            {imageB.id !== imagePrev.id ? (
              <SlideLayer
                key={imageB.id}
                slide={imageB}
                priority
                playVideo={bVisible}
                visible={bVisible}
                className="z-0"
              />
            ) : null}
            {imageA.id !== imagePrev.id && imageA.id !== imageB.id ? (
              <SlideLayer
                key={imageA.id}
                slide={imageA}
                priority={pairIndex === 0}
                playVideo={showOpening || showOpenHold}
                visible={aVisible}
                clipPath={aClipped ? centerClip : undefined}
                className="z-[1]"
              />
            ) : null}
          </>
        )}
      </div>

      {!reducedMotion ? (
        <HeroShutterBars
          combineAmount={combineAmount}
          heroHeightPx={shutterLayout.heroHeightPx}
          barHeightPx={shutterLayout.barHeightPx}
          title={title}
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
        labels={cycle.labels}
      />
    </section>
  );
}
