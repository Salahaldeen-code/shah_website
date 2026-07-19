"use client";

type ActivitiesTitleDrumProps = {
  title: string;
  description: string;
  /** Shared section scroll progress from ActivitiesStage (0–1). */
  progress?: number;
  reducedMotion?: boolean;
};

/** Scroll-driven 3D rolling drum of the ACTIVITIES word. */
export function ActivitiesTitleDrum({
  title,
  description,
  progress = 0.35,
  reducedMotion = false,
}: ActivitiesTitleDrumProps) {
  // Drum rolls one full face (~90°) as scroll progress goes 0 → 1
  const rotateX = reducedMotion ? 18 : progress * 90;
  const faceHeight = "clamp(4.5rem, 16vw, 11rem)";
  const radius = "calc(clamp(4.5rem, 16vw, 11rem) * 0.58)";

  return (
    <div className="relative z-10 flex w-full flex-col items-center px-2 text-center">
      <div
        className="relative flex w-full items-center justify-center py-6 sm:py-8"
        style={{
          perspective: "1200px",
          perspectiveOrigin: "50% 50%",
        }}
      >
        <div
          className="relative w-full"
          style={{
            height: `calc(${faceHeight} * 1.85)`,
            transformStyle: "preserve-3d",
          }}
        >
          <div
            className="absolute inset-x-0 top-1/2 w-full"
            style={{
              transformStyle: "preserve-3d",
              transform: `translateY(-50%) rotateX(${rotateX}deg)`,
              willChange: "transform",
            }}
          >
            {/* Top face — rolls into view from above as drum starts */}
            <p
              aria-hidden="true"
              className="absolute inset-x-0 font-display text-[clamp(3.5rem,14vw,10rem)] leading-none tracking-[-0.02em] text-brand-yellow uppercase"
              style={{
                height: faceHeight,
                lineHeight: faceHeight,
                transform: `rotateX(90deg) translateZ(${radius})`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {title}
            </p>

            {/* Front face */}
            <h2
              id="activities-heading"
              className="absolute inset-x-0 font-display text-[clamp(3.5rem,14vw,10rem)] leading-none tracking-[-0.02em] text-brand-yellow uppercase"
              style={{
                height: faceHeight,
                lineHeight: faceHeight,
                transform: `rotateX(0deg) translateZ(${radius})`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {title}
            </h2>

            {/* Underside face — rolls up as you keep scrolling */}
            <p
              aria-hidden="true"
              className="absolute inset-x-0 font-display text-[clamp(3.5rem,14vw,10rem)] leading-none tracking-[-0.02em] text-brand-yellow uppercase"
              style={{
                height: faceHeight,
                lineHeight: faceHeight,
                transform: `rotateX(-90deg) translateZ(${radius})`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              {title}
            </p>
          </div>
        </div>
      </div>

      <p
        className="mx-auto mt-2 max-w-xl text-[0.68rem] leading-relaxed tracking-[0.16em] text-brand-yellow/90 uppercase sm:mt-3 sm:text-xs md:text-[0.8rem]"
        style={{
          opacity: reducedMotion ? 1 : 0.4 + progress * 0.6,
          transform: reducedMotion
            ? undefined
            : `translate3d(0, ${(1 - progress) * 12}px, 0)`,
        }}
      >
        {description}
      </p>
    </div>
  );
}
