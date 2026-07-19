"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { showcaseGridImages, showcaseSideImages } from "@/config/showcase";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ActiveLifeCollageProps = {
  copy: Dictionary["showcase"];
};

/** Small portrait frames — start fully on-screen, then drift under the title. */
const brandFrames = [
  {
    ...showcaseSideImages.left[0],
    className: "left-[4%] top-[10%] w-[18%] sm:left-[5%] sm:w-[15%] md:w-[13%]",
    depth: 0.45,
    originX: "0vw",
    originY: "0vh",
    driftX: "18vw",
    driftY: "16vh",
  },
  {
    ...showcaseSideImages.left[1],
    className:
      "left-[12%] bottom-[14%] w-[16%] sm:left-[14%] sm:w-[13%] md:w-[11%]",
    depth: 0.65,
    originX: "0vw",
    originY: "0vh",
    driftX: "16vw",
    driftY: "-18vh",
  },
  {
    ...showcaseSideImages.right[0],
    className:
      "right-[12%] top-[12%] w-[16%] sm:right-[14%] sm:w-[13%] md:w-[11%]",
    depth: 0.6,
    originX: "0vw",
    originY: "0vh",
    driftX: "-16vw",
    driftY: "18vh",
  },
  {
    ...showcaseSideImages.right[1],
    className:
      "right-[4%] bottom-[12%] w-[18%] sm:right-[5%] sm:w-[15%] md:w-[13%]",
    depth: 0.5,
    originX: "0vw",
    originY: "0vh",
    driftX: "-18vw",
    driftY: "-16vh",
  },
] as const;

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

export function ActiveLifeCollage({ copy }: ActiveLifeCollageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);
  const progress = reducedMotion ? 0.5 : scrollProgress;

  useEffect(() => {
    if (reducedMotion) return;

    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const next = clamp(-rect.top / total);
      setScrollProgress(next);
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

  // Text settles into true center as progress approaches mid, then holds.
  const textSettle = clamp(progress / 0.4);
  const textY = (1 - textSettle) * 36;
  const textScale = 0.94 + textSettle * 0.06;

  // Ease the small frames under the title, then fade them out once they arrive.
  const underTitle = clamp(progress / 0.7);
  const underEase = underTitle * underTitle * (3 - 2 * underTitle);
  // Hold visible while sliding in, then disappear after they're under the title.
  const frameOpacity = underEase < 0.72 ? 1 : clamp(1 - (underEase - 0.72) / 0.28);

  // Glass neon border only after scroll finishes (frames already under title / gone).
  const glassRaw = reducedMotion ? 1 : clamp((progress - 0.78) / 0.22);
  const glassReveal = glassRaw * glassRaw * (3 - 2 * glassRaw);

  // Grid rises from below and continues past the text.
  const gridY = (1 - progress) * 42 - progress * 28;
  const gridOpacity = 0.55 + progress * 0.45;

  return (
    <section
      ref={sectionRef}
      id="active-life"
      aria-labelledby="active-life-heading"
      className="relative bg-black text-white"
      style={{ "--showcase-progress": String(progress) } as CSSProperties}
    >
      <div className="relative h-[240vh]">
        <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
          {/* Photo layer — always behind the title */}
          <div className="pointer-events-none absolute inset-0 z-0">
            {brandFrames.map((frame, index) => {
              const scale = 1 + underEase * frame.depth * 0.1;
              // calc() blends origin → under-title position by scroll ease
              const x = `calc(${frame.originX} + (${frame.driftX}) * ${underEase})`;
              const y = `calc(${frame.originY} + (${frame.driftY}) * ${underEase})`;

              return (
                <div
                  key={frame.id}
                  className={`absolute aspect-[3/4] overflow-hidden shadow-[0_12px_40px_rgb(0_0_0/0.55)] ${frame.className}`}
                  style={{
                    transform: `translate3d(${x}, ${y}, 0) scale(${scale})`,
                    opacity: frameOpacity,
                    zIndex: index % 2 === 0 ? 2 : 1,
                    willChange: "transform, opacity",
                  }}
                >
                  <Image
                    src={frame.src}
                    alt={frame.alt}
                    fill
                    sizes="(max-width: 768px) 22vw, 16vw"
                    priority={index < 2}
                    className="object-cover"
                  />
                </div>
              );
            })}

            {/* Activity photos scrolling behind the title */}
            <div
              className="absolute inset-x-0 bottom-[-8%] mx-auto w-full max-w-[100rem] px-2 sm:px-3 md:px-4"
              style={{
                transform: `translate3d(0, ${gridY}vh, 0)`,
                opacity: gridOpacity,
                willChange: "transform, opacity",
              }}
            >
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 md:gap-2.5">
                {showcaseGridImages.map((image, index) => {
                  const lag = ((index % 3) - 1) * 12 * progress;
                  return (
                    <div
                      key={image.id}
                      className="relative aspect-[16/10] overflow-hidden bg-brand-surface"
                      style={{
                        transform: `translate3d(0, ${lag}px, 0)`,
                      }}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover object-center"
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Soft veil so type stays readable over moving photos */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5] bg-[radial-gradient(ellipse_at_center,rgb(0_0_0/0.45)_0%,rgb(0_0_0/0.15)_48%,transparent_75%)]"
          />

          {/* Title stays above the photos so frames slide under it */}
          <div
            className="relative z-20 mx-auto w-full max-w-[100rem] px-[6%] text-center sm:px-[8%] md:px-[10%]"
            style={{
              transform: `translate3d(0, ${textY}px, 0) scale(${textScale})`,
              willChange: "transform",
            }}
          >
            <div className="relative mx-auto w-full max-w-5xl px-5 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
              {/* Neon glass border — reveals only at end of scroll */}
              <div
                aria-hidden="true"
                className="showcase-glass"
                style={
                  {
                    "--glass-reveal": String(glassReveal),
                  } as CSSProperties
                }
              >
                <div className="showcase-glass-border" />
                <div className="showcase-glass-inner" />
              </div>

              <div className="relative z-10">
                <h2
                  id="active-life-heading"
                  className="flex w-full flex-col items-center font-display text-[clamp(2.6rem,10vw,7.5rem)] leading-[0.78] tracking-[0.01em] text-brand-yellow uppercase"
                >
                  <span className="block">{copy.brandLine1}</span>

                  <span className="showcase-script relative z-30 my-[-0.1em] block w-[min(115%,28rem)] sm:w-[min(112%,36rem)] md:w-[min(110%,44rem)] lg:w-[min(108%,52rem)]">
                    <svg
                      viewBox="0 0 720 100"
                      className="mx-auto h-auto w-full overflow-visible"
                      aria-hidden="true"
                      focusable="false"
                    >
                      <defs>
                        <path
                          id="showcase-script-arc"
                          d="M 16 68 Q 360 22 704 68"
                          fill="none"
                        />
                      </defs>
                      <text
                        fill="#ffffff"
                        fontSize="38"
                        letterSpacing="1.5"
                        className="showcase-script-text"
                      >
                        <textPath
                          href="#showcase-script-arc"
                          startOffset="50%"
                          textAnchor="middle"
                        >
                          {copy.script}
                        </textPath>
                      </text>
                    </svg>
                    <span className="sr-only">{copy.script}</span>
                  </span>

                  <span className="flex items-center justify-center gap-[0.08em]">
                    <span>{copy.brandLine2}</span>
                    <span className="inline-block translate-y-[0.02em] text-[1.22em] leading-none text-showcase-orange">
                      {copy.brandAmp}
                    </span>
                    <span>{copy.brandLine3}</span>
                  </span>
                </h2>

                <p className="mx-auto mt-4 max-w-4xl text-[0.58rem] leading-relaxed tracking-[0.2em] text-white uppercase sm:mt-5 sm:text-[0.68rem] md:text-xs">
                  {copy.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* View more — appears once the glass frame settles at end of scroll */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[max(5.5rem,12vh)] z-30 flex justify-center px-4"
            style={{
              opacity: glassReveal,
              transform: `translate3d(0, ${(1 - glassReveal) * 16}px, 0)`,
              willChange: "opacity, transform",
            }}
          >
            <Link
              href="/#activities"
              className="pointer-events-auto inline-flex items-center justify-center gap-2 border border-brand-yellow bg-brand-yellow px-7 py-3 font-display text-xs tracking-[0.18em] text-brand-dark uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow sm:px-8 sm:text-sm"
              style={{
                pointerEvents: glassReveal > 0.55 ? "auto" : "none",
              }}
            >
              {copy.viewMore}
              <span aria-hidden="true">›</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
