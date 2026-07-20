"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
} from "react";

import {
  socialFooterConfig,
  type SocialCircleItem,
} from "@/config/socialFooter";
import { cn } from "@/lib/utils";

type SocialCircleProps = {
  item: SocialCircleItem;
  isActive: boolean;
  repulsion: { x: number; y: number };
  scale: number;
  layout: "stage" | "grid";
  reducedMotion: boolean;
  onActivate: (id: string) => void;
  onDeactivate: (id: string) => void;
  stageWidth: number;
};

export function SocialCircle({
  item,
  isActive,
  repulsion,
  scale,
  layout,
  reducedMotion,
  onActivate,
  onDeactivate,
  stageWidth,
}: SocialCircleProps) {
  const { animation, colors } = socialFooterConfig;
  const [imageIndex, setImageIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const href = item.href || "#";

  const size =
    layout === "stage"
      ? Math.round(item.sizePx * Math.min(Math.max(stageWidth / 1280, 1), 1.22))
      : Math.min(item.sizePx * 0.82, 196);

  useEffect(() => {
    item.images.forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, [item.images]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!isActive || reducedMotion || item.images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % item.images.length);
    }, animation.imageIntervalMs);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    animation.imageIntervalMs,
    isActive,
    item.images.length,
    reducedMotion,
  ]);

  const displayIndex = isActive ? imageIndex : 0;

  const handleEnter = useCallback(() => {
    setImageIndex(0);
    onActivate(item.id);
  }, [item.id, onActivate]);
  const handleLeave = useCallback(
    () => onDeactivate(item.id),
    [item.id, onDeactivate],
  );

  const handleFocus = useCallback(() => {
    setImageIndex(0);
    onActivate(item.id);
  }, [item.id, onActivate]);

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLAnchorElement>) => {
      if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
      onDeactivate(item.id);
    },
    [item.id, onDeactivate],
  );

  const staggerY = layout === "grid" ? item.mobileStaggerPx : 0;

  const transform =
    layout === "stage"
      ? `translate3d(${repulsion.x}px, ${repulsion.y}px, 0) scale(${scale})`
      : `translate3d(0, ${staggerY}px, 0) scale(${scale})`;

  const stageStyle: CSSProperties =
    layout === "stage"
      ? {
          left: `${item.position.left}%`,
          top: `${item.position.top}%`,
          width: size,
          height: size,
          zIndex: isActive ? 20 : item.zIndex,
          transform,
        }
      : {
          width: size,
          height: size,
          zIndex: isActive ? 20 : item.zIndex,
          transform: `scale(${scale})`,
        };

  return (
    <Link
      href={href}
      aria-label={`Visit our ${item.name}`}
      data-social-circle={item.id}
      onMouseEnter={layout === "stage" ? handleEnter : undefined}
      onMouseLeave={layout === "stage" ? handleLeave : undefined}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={
        layout === "grid"
          ? (event) => {
              if (!isActive) {
                event.preventDefault();
                setImageIndex(0);
                onActivate(item.id);
              }
            }
          : undefined
      }
      className={cn(
        "social-circle group relative block shrink-0 overflow-hidden rounded-full bg-black/10 shadow-[0_8px_24px_rgb(0_0_0_/0.18)]",
        layout === "stage" && "absolute",
        layout === "grid" && "justify-self-center",
        isActive && "social-circle--active",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-dark",
      )}
      style={
        {
          ...stageStyle,
          "--social-transition-duration": `${animation.transitionDurationMs}ms`,
          "--social-transition-easing": animation.transitionEasing,
          "--social-image-transition": `${animation.imageTransitionMs}ms`,
          "--social-active-outline": `${animation.activeOutlinePx}px`,
          boxShadow: isActive
            ? `0 0 0 ${animation.activeOutlinePx}px ${colors.activeOutline}, 0 12px 32px rgb(0 0 0 / 0.22)`
            : undefined,
        } as CSSProperties
      }
    >
      <span className="sr-only">{item.name}</span>

      {item.images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt=""
          aria-hidden
          fill
          sizes={`${size}px`}
          className={cn(
            "social-circle-image object-cover",
            index === displayIndex ? "opacity-100" : "opacity-0",
          )}
          draggable={false}
        />
      ))}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center bg-black/15 font-display text-[clamp(3rem,10vw,5.5rem)] leading-none tracking-[0.06em] text-white uppercase"
        style={{ color: colors.circleLabel }}
      >
        {item.label}
      </span>
    </Link>
  );
}
