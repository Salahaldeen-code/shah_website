"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

import { ActivitiesTitleDrum } from "@/components/home/ActivitiesTitleDrum";
import {
  activitiesMembershipImage,
  activityItems,
  activityPairs,
  type ActivityItem,
  type ActivityTagKey,
  type ActivityTitleKey,
} from "@/config/activities";

export type ActivitiesCopy = {
  title: string;
  description: string;
  items: Record<ActivityTitleKey, string>;
  tags: Record<ActivityTagKey, string>;
  membership: {
    titleLine1: string;
    titleLine2: string;
    description: string;
    joinCta: string;
    imageAlt: string;
  };
};

type ActivitiesStageProps = {
  copy: ActivitiesCopy;
};

function clamp(value: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function range(progress: number, edge0: number, edge1: number) {
  return clamp((progress - edge0) / Math.max(0.0001, edge1 - edge0));
}

function smooth(t: number) {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t);
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

const activityCardWidthClass = "w-[min(62%,19rem)] sm:w-[21rem] lg:w-[23.5rem]";

type ActivityPanelProps = {
  item: ActivityItem;
  title: string;
  tag: string;
  className: string;
  style?: CSSProperties;
  compact?: boolean;
};

function ActivityPanel({
  item,
  title,
  tag,
  className,
  style,
  compact = false,
}: ActivityPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const stopPreview = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPlaying(false);
  };

  const startPreview = () => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;
    const play = video.play();
    if (play) {
      play
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  useEffect(() => {
    if (!reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setPlaying(false);
  }, [reducedMotion]);

  return (
    <article className={`activities-panel ${className}`} style={style}>
      <div
        className="group relative overflow-hidden bg-brand-surface"
        onMouseEnter={startPreview}
        onMouseLeave={stopPreview}
        onFocus={startPreview}
        onBlur={stopPreview}
      >
        <div
          className={`relative w-full ${compact ? "aspect-[3/4]" : "aspect-[4/5]"}`}
        >
          <Image
            src={item.image}
            alt={title}
            fill
            sizes={
              compact
                ? "(max-width: 639px) 46vw, 376px"
                : "(max-width: 768px) 62vw, 376px"
            }
            className={`object-cover transition-[opacity,transform] duration-500 ease-out group-hover:scale-[1.03] ${
              playing ? "opacity-0" : "opacity-100"
            }`}
          />
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              playing ? "opacity-100" : "opacity-0"
            }`}
            src={item.video}
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
        <div
          className={`flex items-center gap-2 bg-black ${
            compact ? "flex-wrap px-2.5 py-2.5" : "px-3 py-3"
          }`}
        >
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 shrink-0 bg-brand-yellow"
          />
          <h3
            className={`min-w-0 flex-1 font-display tracking-[0.06em] text-white uppercase ${
              compact ? "text-[0.7rem] leading-snug" : "text-sm sm:text-base"
            }`}
          >
            {title}
          </h3>
          <span
            className={`shrink-0 bg-white/10 tracking-[0.14em] text-white/80 uppercase ${
              compact
                ? "px-1.5 py-0.5 text-[0.5rem]"
                : "px-2 py-0.5 text-[0.55rem]"
            }`}
          >
            {tag}
          </span>
        </div>
      </div>
    </article>
  );
}

function MobileActivitiesLayout({ copy }: { copy: ActivitiesCopy }) {
  return (
    <div className="relative bg-black px-[var(--container-padding)] pt-12 pb-6">
      <header className="mx-auto max-w-lg text-center">
        <h2 className="font-display text-[clamp(2.75rem,14vw,4.5rem)] leading-none tracking-[-0.02em] text-brand-yellow uppercase">
          {copy.title}
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-[0.72rem] leading-relaxed tracking-[0.12em] text-white/70 uppercase">
          {copy.description}
        </p>
      </header>

      <ul className="mx-auto mt-8 grid max-w-lg grid-cols-2 gap-3">
        {activityItems.map((item) => (
          <li key={item.id}>
            <ActivityPanel
              item={item}
              title={copy.items[item.titleKey]}
              tag={copy.tags[item.tagKey]}
              className="w-full"
              compact
              style={{ animation: "none" }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ActivityPairLayer({
  pair,
  copy,
  shiftY,
  opacity,
  inert,
  showTopLeft = true,
  showBottomRight = true,
}: {
  pair: (typeof activityPairs)[number];
  copy: ActivitiesCopy;
  shiftY: string;
  opacity: number;
  inert?: boolean;
  showTopLeft?: boolean;
  showBottomRight?: boolean;
}) {
  const topLeft = pair.items.find((item) => item.slot === "topLeft")!;
  const bottomRight = pair.items.find((item) => item.slot === "bottomRight")!;

  return (
    <div
      className="absolute inset-0 z-20"
      style={{
        transform: `translate3d(0, ${shiftY}, 0)`,
        opacity,
        willChange: "transform, opacity",
        pointerEvents: inert || opacity < 0.2 ? "none" : "auto",
      }}
      aria-hidden={inert || opacity < 0.15 ? true : undefined}
    >
      {showTopLeft ? (
        <ActivityPanel
          item={topLeft}
          title={copy.items[topLeft.titleKey]}
          tag={copy.tags[topLeft.tagKey]}
          className={`absolute top-0 left-0 z-20 ${activityCardWidthClass}`}
          style={{ animation: "none" }}
        />
      ) : null}
      {showBottomRight ? (
        <ActivityPanel
          item={bottomRight}
          title={copy.items[bottomRight.titleKey]}
          tag={copy.tags[bottomRight.tagKey]}
          className={`absolute right-0 bottom-0 z-20 ${activityCardWidthClass}`}
          style={{ animation: "none" }}
        />
      ) : null}
    </div>
  );
}

/** Normal document-flow Join the Movement block (not sticky). */
function MembershipAct({
  membership,
}: {
  membership: ActivitiesCopy["membership"];
}) {
  return (
    <div
      id="membership"
      aria-labelledby="membership-heading"
      className="relative overflow-hidden bg-black"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_55%,rgb(225_29_46/0.18),transparent_48%),radial-gradient(ellipse_at_15%_80%,rgb(245_197_24/0.05),transparent_45%)]"
      />

      <div className="relative mx-auto grid min-h-[min(88svh,44rem)] w-full max-w-[96rem] items-center gap-10 px-[clamp(1.25rem,5vw,3.5rem)] py-16 sm:py-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-4 lg:py-8">
        <div className="relative z-10 max-w-xl">
          <h2
            id="membership-heading"
            className="font-display text-[clamp(3.25rem,10vw,8.5rem)] leading-[0.84] tracking-[-0.03em] text-brand-yellow uppercase"
          >
            <span className="block">{membership.titleLine1}</span>
            <span className="mt-0.5 block text-[0.78em] leading-[0.9] tracking-[-0.02em] sm:text-[0.82em]">
              {membership.titleLine2}
            </span>
          </h2>

          <p className="mt-7 max-w-[28rem] text-[0.95rem] leading-[1.55] tracking-[0.12em] text-white uppercase sm:mt-8 sm:text-[1.05rem] md:text-[1.1rem]">
            {membership.description}
          </p>

          <div className="mt-9 sm:mt-10">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center border border-brand-yellow bg-brand-yellow px-7 py-3.5 font-display text-sm tracking-[0.16em] text-brand-dark uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
            >
              {membership.joinCta}
            </Link>
          </div>
        </div>

        <div className="relative z-20 mx-auto flex h-[min(64svh,32rem)] w-full max-w-[28rem] items-end justify-center sm:h-[min(70svh,38rem)] lg:mx-0 lg:h-[min(78svh,44rem)] lg:max-w-none lg:justify-end">
          <div className="relative h-full w-full max-w-[22rem] sm:max-w-[26rem] lg:max-w-[30rem]">
            <Image
              src={activitiesMembershipImage}
              alt={membership.imageAlt}
              fill
              sizes="(max-width: 1024px) 80vw, 42vw"
              className="object-contain object-bottom"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Sticky Activities stage (cards + Aerial Yoga), then normal Join the Movement below.
 * Phone (<640px): simple title + 2×2 grid — no overlapping absolute cards.
 */
export function ActivitiesStage({ copy }: ActivitiesStageProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);
  const { membership } = copy;

  useEffect(() => {
    if (reducedMotion) return;

    const track = trackRef.current;
    if (!track) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = track.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      setProgress(clamp(-rect.top / total));
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

  const pairShift = reducedMotion ? 0 : smooth(range(progress, 0.02, 0.38));
  const stageLift = reducedMotion ? 0 : smooth(range(progress, 0.28, 0.94));
  const rise = reducedMotion ? 1 : smooth(range(progress, 0.3, 0.78));

  const pairA = activityPairs[0];
  const pairB = activityPairs[1];
  const featured = pairB.items.find((item) => item.slot === "bottomRight")!;

  const pairAOpacity = Math.max(0, 1 - pairShift * 1.2);
  const danceOpacity =
    smooth(range(pairShift, 0, 0.5)) * (1 - rise * 1.1) * (1 - stageLift * 0.6);

  const featuredLeft = 76;
  const featuredTop = lerp(78, 48, rise);
  const featuredOpacity =
    Math.min(1, rise * 1.55 + 0.04) *
    (1 - smooth(range(stageLift, 0.15, 0.85)));
  const featuredScale = 0.94 + rise * 0.08;
  const featuredYOffset = lerp(0, -40, rise);

  const featuredStyle: CSSProperties = {
    animation: "none",
    left: `${featuredLeft}%`,
    top: `${featuredTop}%`,
    right: "auto",
    bottom: "auto",
    transform: `translate3d(-50%, ${featuredYOffset}%, 0) scale(${featuredScale})`,
    opacity: featuredOpacity,
    zIndex: 40,
    pointerEvents: featuredOpacity < 0.15 ? "none" : undefined,
  };

  const featuredCardClass = `absolute z-40 ${activityCardWidthClass}`;

  const drumProgress = reducedMotion
    ? 0.35
    : smooth(range(progress, 0.02, 0.55));

  const stageTranslateY = -stageLift * 120;
  const stageOpacity = Math.max(0, 1 - stageLift * 1.2);
  const stageGone = stageLift > 0.92;

  const bottomReveal = smooth(range(Math.max(rise, stageLift), 0.05, 0.7));
  const fieldMaskStop = 100 - bottomReveal * 85;
  const fieldMask =
    bottomReveal < 0.02
      ? undefined
      : `linear-gradient(to bottom, #000 0%, #000 ${fieldMaskStop}%, transparent 100%)`;

  return (
    <div className="relative bg-black">
      {/* Phone: readable 2×2 grid (no overlapping absolute cards) */}
      <div className="sm:hidden">
        <MobileActivitiesLayout copy={copy} />
      </div>

      {/* Tablet / desktop: sticky scroll stage */}
      <div className="hidden sm:block">
        {reducedMotion ? (
          <div className="relative mx-auto flex min-h-svh w-full max-w-[90rem] items-center px-[var(--container-padding)] py-16 sm:py-20">
            <div className="relative mx-auto min-h-[28rem] w-full md:min-h-[34rem] lg:min-h-[38rem]">
              <ActivityPairLayer
                pair={pairA}
                copy={copy}
                shiftY="0%"
                opacity={1}
              />
              <ActivityPanel
                item={featured}
                title={copy.items[featured.titleKey]}
                tag={copy.tags[featured.tagKey]}
                className={featuredCardClass}
                style={{
                  animation: "none",
                  left: "76%",
                  top: "48%",
                  transform: "translate3d(-50%, -40%, 0)",
                }}
              />
              <div className="pointer-events-none relative z-10 md:absolute md:inset-0 md:flex md:items-center md:justify-center">
                <ActivitiesTitleDrum
                  title={copy.title}
                  description={copy.description}
                  progress={0.35}
                  reducedMotion
                />
              </div>
            </div>
          </div>
        ) : (
          <div ref={trackRef} className="relative h-[280vh]">
            <div
              className="sticky top-0 h-svh overflow-hidden bg-transparent"
              style={{
                zIndex: stageGone ? 0 : 20,
                pointerEvents: stageGone ? "none" : undefined,
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 z-0 bg-black"
                style={{
                  opacity: stageGone ? 0 : 1,
                  WebkitMaskImage: fieldMask,
                  maskImage: fieldMask,
                }}
              />

              <div
                className="absolute inset-0 z-10"
                style={{
                  transform: `translate3d(0, ${stageTranslateY}%, 0)`,
                  opacity: stageOpacity,
                  visibility: stageGone ? "hidden" : undefined,
                  willChange: "transform, opacity",
                }}
                aria-hidden={stageGone ? true : undefined}
              >
                <div className="relative mx-auto flex h-full w-full max-w-[90rem] items-center px-[var(--container-padding)] py-16 sm:py-20">
                  <div className="relative mx-auto min-h-[28rem] w-full md:min-h-[34rem] lg:min-h-[38rem]">
                    <div className="pointer-events-none relative z-10 md:absolute md:inset-0 md:flex md:items-center md:justify-center">
                      <ActivitiesTitleDrum
                        title={copy.title}
                        description={copy.description}
                        progress={drumProgress}
                        reducedMotion={false}
                      />
                    </div>

                    {pairAOpacity > 0.02 ? (
                      <ActivityPairLayer
                        pair={pairA}
                        copy={copy}
                        shiftY={`${-pairShift * 120}%`}
                        opacity={pairAOpacity}
                        inert={pairShift > 0.8}
                      />
                    ) : null}

                    {danceOpacity > 0.02 ? (
                      <ActivityPairLayer
                        pair={pairB}
                        copy={copy}
                        shiftY={`${(1 - pairShift) * 50}%`}
                        opacity={danceOpacity}
                        inert={rise > 0.35}
                        showTopLeft
                        showBottomRight={false}
                      />
                    ) : null}

                    <ActivityPanel
                      item={featured}
                      title={copy.items[featured.titleKey]}
                      tag={copy.tags[featured.tagKey]}
                      className={featuredCardClass}
                      style={featuredStyle}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 sm:-mt-[90vh]">
        <MembershipAct membership={membership} />
      </div>
    </div>
  );
}
