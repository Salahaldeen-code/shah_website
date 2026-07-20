"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { socialFooterConfig, type SocialCircleItem } from "@/config/socialFooter";
import { cn } from "@/lib/utils";

import { FooterBottom } from "./FooterBottom";
import { SocialCircle } from "./SocialCircle";

type Breakpoint = "mobile" | "tablet" | "desktop";

function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint("mobile");
      else if (width < 1024) setBreakpoint("tablet");
      else setBreakpoint("desktop");
    };

    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);

  return breakpoint;
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

function getCircleCenter(
  item: SocialCircleItem,
  stageWidth: number,
  stageHeight: number,
  size: number,
) {
  return {
    x: (item.position.left / 100) * stageWidth + size / 2,
    y: (item.position.top / 100) * stageHeight + size / 2,
  };
}

function computeRepulsionOffsets(
  items: readonly SocialCircleItem[],
  activeId: string | null,
  stageWidth: number,
  stageHeight: number,
  repulsionPx: number,
  reducedMotion: boolean,
): Record<string, { x: number; y: number }> {
  const offsets: Record<string, { x: number; y: number }> = {};
  items.forEach((item) => {
    offsets[item.id] = { x: 0, y: 0 };
  });

  if (!activeId || repulsionPx <= 0 || reducedMotion) return offsets;

  const activeItem = items.find((item) => item.id === activeId);
  if (!activeItem) return offsets;

  const activeSize = Math.round(
    activeItem.sizePx * Math.min(Math.max(stageWidth / 1280, 1), 1.22),
  );
  const activeCenter = getCircleCenter(
    activeItem,
    stageWidth,
    stageHeight,
    activeSize,
  );

  items.forEach((item) => {
    if (item.id === activeId) return;

    const size = Math.round(
      item.sizePx * Math.min(Math.max(stageWidth / 1280, 1), 1.22),
    );
    const center = getCircleCenter(item, stageWidth, stageHeight, size);
    const dx = center.x - activeCenter.x;
    const dy = center.y - activeCenter.y;
    const distance = Math.hypot(dx, dy) || 1;

    const push =
      repulsionPx *
      (1 + socialFooterConfig.animation.activeScale * 0.15);

    offsets[item.id] = {
      x: (dx / distance) * push,
      y: (dy / distance) * push,
    };
  });

  return offsets;
}

export function SocialFooter() {
  const { colors, heading, animation, stageMinHeight, socialItems } =
    socialFooterConfig;
  const breakpoint = useBreakpoint();
  const reducedMotion = usePrefersReducedMotion();
  const stageRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [stageSize, setStageSize] = useState({ width: 1280, height: 520 });

  const layout = breakpoint === "mobile" ? "grid" : "stage";

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || layout === "grid") return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setStageSize({ width, height });
    });

    observer.observe(stage);
    return () => observer.disconnect();
  }, [layout]);

  useEffect(() => {
    if (layout !== "grid" || activeId === null) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!stageRef.current?.contains(target)) {
        setActiveId(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [activeId, layout]);

  const repulsionPx =
    breakpoint === "desktop"
      ? animation.repulsionPx.desktop
      : breakpoint === "tablet"
        ? animation.repulsionPx.tablet
        : animation.repulsionPx.mobile;

  const repulsionOffsets = useMemo(
    () =>
      computeRepulsionOffsets(
        socialItems,
        activeId,
        stageSize.width,
        stageSize.height,
        repulsionPx,
        reducedMotion,
      ),
    [
      activeId,
      reducedMotion,
      repulsionPx,
      socialItems,
      stageSize.height,
      stageSize.width,
    ],
  );

  const handleActivate = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDeactivate = useCallback((id: string) => {
    setActiveId((current) => (current === id ? null : current));
  }, []);

  const handleStageLeave = useCallback(() => {
    if (layout === "stage") setActiveId(null);
  }, [layout]);

  const stageMinH =
    breakpoint === "desktop"
      ? stageMinHeight.desktop
      : breakpoint === "tablet"
        ? stageMinHeight.tablet
        : stageMinHeight.mobile;

  const sortedMobileItems = [...socialItems].sort(
    (a, b) => a.mobileOrder - b.mobileOrder,
  );

  return (
    <footer
      className="relative w-full overflow-x-clip pb-[calc(var(--content-bottom-pad)+0.5rem)]"
      style={{ backgroundColor: colors.background, color: colors.text }}
    >
      <div className="mx-auto w-full max-w-[100rem] px-[var(--container-padding)] pt-10 sm:pt-12 md:pt-14">
        <section
          ref={stageRef}
          aria-label="Social media links"
          onMouseLeave={handleStageLeave}
          className={cn(
            "relative mx-auto w-full",
            layout === "stage" && "social-footer-stage",
            layout === "grid" &&
              "social-footer-grid grid grid-cols-2 gap-x-4 gap-y-6 py-2 sm:gap-x-6 sm:gap-y-8",
          )}
          style={
            layout === "stage"
              ? { minHeight: stageMinH }
              : undefined
          }
        >
          {(layout === "stage" ? socialItems : sortedMobileItems).map(
            (item) => {
              const isActive = activeId === item.id;
              const scale =
                isActive && !reducedMotion
                  ? animation.activeScale
                  : isActive && reducedMotion
                    ? 1.04
                    : 1;

              return (
                <SocialCircle
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  repulsion={repulsionOffsets[item.id] ?? { x: 0, y: 0 }}
                  scale={scale}
                  layout={layout}
                  reducedMotion={reducedMotion}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  stageWidth={stageSize.width}
                />
              );
            },
          )}
        </section>

        <h2 className="mx-auto mt-8 max-w-[52rem] text-center font-display text-[clamp(1.75rem,5.5vw,3.75rem)] leading-[0.95] tracking-[0.04em] uppercase sm:mt-10 md:mt-12">
          {heading}
        </h2>
      </div>

      <div className="mt-8 sm:mt-10">
        <FooterBottom />
      </div>
    </footer>
  );
}
