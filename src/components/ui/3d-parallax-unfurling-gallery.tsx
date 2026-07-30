"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/** Unique local sports frames — column loops reuse these without source duplicates. */
const FALLBACK_GALLERY_IMAGES = [
  "/images/hero/image1.jpg",
  "/images/hero/image2.jpg",
  "/images/hero/image3.jpg",
  "/images/hero/image4.jpg",
  "/images/hero/image5.jpg",
  "/images/hero/image6.jpg",
  "/images/hero/slide-1.png",
  "/images/hero/slide-2.png",
  "/images/hero/slide-3.png",
  "/images/hero/slide-4.png",
  "/images/hero/slide-5.png",
  "/images/hero/slide-6.png",
] as const;

const FALLBACK_IMAGE_ALTS = [
  "Athletes on the track",
  "Community football on the field",
  "Outdoor basketball session",
  "Open water and training day",
  "Cycling at golden hour",
  "Team warm-up on the grass",
  "Beach volleyball rally",
  "Sprint start on the track",
  "Weekend park gathering",
  "Court play under the lights",
  "Trail ride through the city",
  "Match day action",
] as const;

export type GalleryReelCopy = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
};

export type GalleryReelImage = {
  src: string;
  alt: string;
};

/** Smaller delivery for the 3D wall — full assets stay on /gallery. */
function galleryReelSrc(src: string): string {
  if (!src.includes("res.cloudinary.com/") || !src.includes("/upload/")) {
    return src;
  }
  if (/\/upload\/[^/]*[cw]_/.test(src)) return src;
  return src.replace(
    "/upload/",
    "/upload/c_fill,w_420,h_560,f_auto,q_auto/",
  );
}

type ImageCardProps = {
  src: string;
  alt: string;
  loadSrc: boolean;
  onLoad?: () => void;
};

function ImageCard({ src, alt, loadSrc, onLoad }: ImageCardProps) {
  return (
    <div className="group relative h-[160px] w-full shrink-0 overflow-hidden rounded-sm bg-brand-dark transform-3d sm:h-[240px] md:h-[300px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- gallery uses plain img for deferred columns */}
      {loadSrc ? (
        <img
          src={galleryReelSrc(src)}
          alt={alt}
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onLoad={onLoad}
          className="h-full w-full object-cover opacity-85 transition duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
        />
      ) : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
      />
    </div>
  );
}

type ThreeDParallaxUnfurlingGalleryProps = {
  copy?: GalleryReelCopy;
  /** Activity album images (shuffled). Falls back to static hero frames. */
  images?: GalleryReelImage[];
};

const DEFAULT_COPY: GalleryReelCopy = {
  eyebrow: "PSR",
  title: "Moments in motion",
  subtitle: "Scroll through highlights from the field, court, and community.",
  cta: "Explore the gallery",
};

export default function ThreeDParallaxUnfurlingGallery({
  copy = DEFAULT_COPY,
  images,
}: ThreeDParallaxUnfurlingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadImages, setLoadImages] = useState(false);
  const loadedCountRef = useRef(0);
  const prefersReducedMotion = useReducedMotion();

  const handleItemLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (!isReady && loadedCountRef.current >= 1) setIsReady(true);
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Only fetch thumbnails once the reel is near the viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setLoadImages(true);
        io.disconnect();
      },
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  const sourceImages = useMemo((): GalleryReelImage[] => {
    const pool =
      images?.length ?
        images
      : FALLBACK_GALLERY_IMAGES.map((src, index) => ({
          src,
          alt: FALLBACK_IMAGE_ALTS[index] ?? "PSR gallery moment",
        }));
    return pool.slice(0, 12);
  }, [images]);

  const colMedia = useMemo(() => {
    const columns = [0, 1, 2, 3].map((offset) => {
      const base = sourceImages
        .filter((_, i) => i % 4 === offset)
        .map((item) => ({
          src: item.src,
          alt: item.alt || "PSR gallery moment",
        }));
      const filled =
        base.length > 0
          ? base
          : sourceImages.slice(0, Math.max(1, sourceImages.length));
      // One loop duplicate is enough for the column scroll
      return [...filled, ...filled];
    });

    return {
      col1: columns[0],
      col2: columns[1],
      col3: columns[2],
      col4: columns[3],
    };
  }, [sourceImages]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Direct scroll mapping (no spring) — avoids continuous compositor work after scroll
  const progress = scrollYProgress;

  const bannerWidth = useTransform(progress, [0, 0.12], ["92vw", "100vw"]);
  const bannerHeight = useTransform(progress, [0, 0.12], ["82svh", "100svh"]);
  const bannerRadius = useTransform(progress, [0, 0.12], [28, 0]);
  const bannerBorder = useTransform(
    progress,
    [0, 0.12],
    ["1px solid rgb(250 200 20 / 0.35)", "1px solid transparent"],
  );

  // Gentler unfurl — keeps the wall centered instead of dumping empty space left.
  const rotateY = useTransform(progress, [0.1, 1], [-28, -4]);
  const rotateX = useTransform(progress, [0.1, 1], [16, 2]);
  const rotateZ = useTransform(progress, [0.1, 1], [8, 1]);
  const translateZ = useTransform(progress, [0.1, 1], [-420, 40]);
  const translateX = useTransform(progress, [0.1, 1], ["8%", "0%"]);

  const yCol1 = useTransform(progress, [0.1, 1], ["8%", "-35%"]);
  const yCol2 = useTransform(progress, [0.1, 1], ["-28%", "12%"]);
  const yCol3 = useTransform(progress, [0.1, 1], ["4%", "-38%"]);
  const yCol4 = useTransform(progress, [0.1, 1], ["-20%", "18%"]);

  const introOpacity = useTransform(progress, [0, 0.18, 0.32], [1, 1, 0]);
  const introY = useTransform(progress, [0, 0.32], ["0%", "-18%"]);
  const ctaOpacity = useTransform(progress, [0.72, 0.88, 1], [0, 1, 1]);
  const ctaY = useTransform(progress, [0.72, 1], ["24px", "0px"]);

  return (
    <section
      ref={containerRef}
      id="gallery-reel"
      aria-labelledby="gallery-reel-heading"
      className="relative h-[400vh] w-full scroll-mt-24 bg-brand-dark font-sans text-white selection:bg-brand-yellow selection:text-brand-dark"
      data-ready={isReady ? "true" : "false"}
    >
      <div className="sticky top-0 flex h-svh w-full items-center justify-center overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,rgb(220_10_0/0.16),transparent_62%),radial-gradient(ellipse_45%_40%_at_78%_22%,rgb(0_75_170/0.18),transparent_55%)]"
        />

        <motion.div
          style={{
            width: bannerWidth,
            height: bannerHeight,
            borderRadius: bannerRadius,
            border: bannerBorder,
          }}
          className="relative mx-auto flex max-w-[1920px] items-center justify-center overflow-hidden bg-black transform-3d"
        >
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            style={{ perspective: "1400px", perspectiveOrigin: "52% 46%" }}
          >
            <div className="absolute inset-0 z-20 shadow-[inset_0_80px_120px_-40px_rgba(0,0,0,0.95),inset_0_-100px_140px_-40px_rgba(0,0,0,0.98)]" />
            <div className="absolute inset-0 z-20 shadow-[inset_100px_0_120px_-50px_rgba(0,0,0,0.85),inset_-100px_0_120px_-50px_rgba(0,0,0,0.85)]" />

            <motion.div
              style={{
                rotateX: prefersReducedMotion ? 4 : rotateX,
                rotateY: prefersReducedMotion ? -6 : rotateY,
                rotateZ: prefersReducedMotion ? 1 : rotateZ,
                z: prefersReducedMotion ? 0 : translateZ,
                x: prefersReducedMotion ? 0 : translateX,
                transformStyle: "preserve-3d",
              }}
              className="flex h-[130vh] w-[110vw] origin-center items-center justify-center gap-3 transform-gpu md:gap-5"
            >
              {(
                [
                  [colMedia.col1, yCol1],
                  [colMedia.col2, yCol2],
                  [colMedia.col3, yCol3],
                  [colMedia.col4, yCol4],
                ] as const
              ).map(([items, y], colIndex) => (
                <motion.div
                  key={`col-${colIndex}`}
                  style={{ y: prefersReducedMotion ? 0 : y }}
                  className="pointer-events-auto flex w-[24vw] min-w-[170px] max-w-[260px] flex-col gap-3 transform-gpu md:gap-5"
                >
                  {items.map((item, index) => (
                    <ImageCard
                      key={`col${colIndex}-${index}`}
                      src={item.src}
                      alt={item.alt}
                      loadSrc={loadImages}
                      onLoad={handleItemLoad}
                    />
                  ))}
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Intro copy — fades as the wall unfurls */}
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="pointer-events-none absolute inset-0 z-30 flex items-end justify-start p-6 sm:p-10 md:p-14"
          >
            <div className="max-w-xl">
              <p className="mb-3 font-display text-[0.7rem] tracking-[0.28em] text-brand-yellow uppercase">
                {copy.eyebrow}
              </p>
              <h2
                id="gallery-reel-heading"
                className="font-display text-[clamp(2.4rem,7vw,4.75rem)] leading-[0.92] tracking-[-0.03em] text-white uppercase"
              >
                {copy.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75 sm:text-base">
                {copy.subtitle}
              </p>
            </div>
          </motion.div>

          {/* End CTA */}
          <motion.div
            style={{ opacity: ctaOpacity, y: ctaY }}
            className="absolute inset-x-0 bottom-8 z-30 flex justify-center px-6 sm:bottom-12"
          >
            <Link
              href="/gallery"
              className="pointer-events-auto inline-flex items-center gap-2 bg-brand-yellow px-5 py-3 font-display text-xs tracking-[0.14em] text-brand-dark uppercase transition hover:bg-brand-yellow-soft"
            >
              {copy.cta}
              <span aria-hidden="true">›</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
