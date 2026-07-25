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
  useSpring,
  useTransform,
} from "framer-motion";

/** Unique local sports frames — column loops reuse these without source duplicates. */
const GALLERY_IMAGES = [
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

const IMAGE_ALTS = [
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

type ImageCardProps = {
  src: string;
  alt: string;
  onLoad?: () => void;
};

function ImageCard({ src, alt, onLoad }: ImageCardProps) {
  return (
    <div className="group relative h-[180px] w-full shrink-0 overflow-hidden rounded-sm bg-brand-dark transform-3d sm:h-[260px] md:h-[340px]">
      {/* eslint-disable-next-line @next/next/no-img-element -- gallery uses plain img for lazy columns */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={onLoad}
        className="h-full w-full object-cover opacity-85 transition duration-500 ease-out group-hover:scale-[1.04] group-hover:opacity-100"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-40"
      />
    </div>
  );
}

type ThreeDParallaxUnfurlingGalleryProps = {
  copy?: GalleryReelCopy;
};

const DEFAULT_COPY: GalleryReelCopy = {
  eyebrow: "PSR",
  title: "Moments in motion",
  subtitle: "Scroll through highlights from the field, court, and community.",
  cta: "Explore the gallery",
};

export default function ThreeDParallaxUnfurlingGallery({
  copy = DEFAULT_COPY,
}: ThreeDParallaxUnfurlingGalleryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
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

  const colMedia = useMemo(() => {
    const columns = [0, 1, 2, 3].map((offset) => {
      const base = GALLERY_IMAGES.filter((_, i) => i % 4 === offset).map(
        (src, i) => ({
          src,
          alt: IMAGE_ALTS[offset + i * 4] ?? "PSR gallery moment",
        }),
      );
      // Loop tiles for continuous column travel without repeating the source list.
      return [...base, ...base, ...base];
    });

    return {
      col1: columns[0],
      col2: columns[1],
      col3: columns[2],
      col4: columns[3],
    };
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: prefersReducedMotion ? 200 : 90,
    damping: prefersReducedMotion ? 40 : 24,
    mass: 0.45,
  });

  const bannerWidth = useTransform(
    smoothProgress,
    [0, 0.12],
    ["92vw", "100vw"],
  );
  const bannerHeight = useTransform(
    smoothProgress,
    [0, 0.12],
    ["82svh", "100svh"],
  );
  const bannerRadius = useTransform(smoothProgress, [0, 0.12], [28, 0]);
  const bannerBorder = useTransform(
    smoothProgress,
    [0, 0.12],
    ["1px solid rgb(250 200 20 / 0.35)", "1px solid transparent"],
  );

  // Gentler unfurl — keeps the wall centered instead of dumping empty space left.
  const rotateY = useTransform(smoothProgress, [0.1, 1], [-28, -4]);
  const rotateX = useTransform(smoothProgress, [0.1, 1], [16, 2]);
  const rotateZ = useTransform(smoothProgress, [0.1, 1], [8, 1]);
  const translateZ = useTransform(smoothProgress, [0.1, 1], [-420, 40]);
  const translateX = useTransform(smoothProgress, [0.1, 1], ["8%", "0%"]);

  const yCol1 = useTransform(smoothProgress, [0.1, 1], ["8%", "-35%"]);
  const yCol2 = useTransform(smoothProgress, [0.1, 1], ["-28%", "12%"]);
  const yCol3 = useTransform(smoothProgress, [0.1, 1], ["4%", "-38%"]);
  const yCol4 = useTransform(smoothProgress, [0.1, 1], ["-20%", "18%"]);

  const introOpacity = useTransform(smoothProgress, [0, 0.18, 0.32], [1, 1, 0]);
  const introY = useTransform(smoothProgress, [0, 0.32], ["0%", "-18%"]);
  const ctaOpacity = useTransform(smoothProgress, [0.72, 0.88, 1], [0, 1, 1]);
  const ctaY = useTransform(smoothProgress, [0.72, 1], ["24px", "0px"]);

  return (
    <section
      ref={containerRef}
      id="gallery-reel"
      aria-labelledby="gallery-reel-heading"
      className="relative h-[480vh] w-full scroll-mt-24 bg-brand-dark font-sans text-white selection:bg-brand-yellow selection:text-brand-dark"
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
          className="relative mx-auto flex max-w-[1920px] items-center justify-center overflow-hidden bg-black will-change-transform transform-3d"
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
              className="flex h-[145vh] w-[115vw] origin-center items-center justify-center gap-3 will-change-transform md:gap-5"
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
                  className="pointer-events-auto flex w-[24vw] min-w-[170px] max-w-[280px] flex-col gap-3 md:gap-5"
                >
                  {items.map((item, index) => (
                    <ImageCard
                      key={`col${colIndex}-${index}`}
                      src={item.src}
                      alt={item.alt}
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
