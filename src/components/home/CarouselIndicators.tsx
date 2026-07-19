type CarouselIndicatorsProps = {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  labels: string[];
};

/**
 * Active fill uses --carousel-progress (0–1) from the hero rAF loop via scaleX.
 * Inactive segments use static scaleX so progress never drives layout width.
 */
export function CarouselIndicators({
  count,
  activeIndex,
  onSelect,
  labels,
}: CarouselIndicatorsProps) {
  return (
    <div
      className="absolute inset-x-0 bottom-[calc(var(--content-bottom-pad)+0.25rem)] z-10 flex justify-center px-[var(--container-padding)] sm:bottom-[calc(var(--content-bottom-pad)+0.75rem)]"
      role="tablist"
      aria-label="Slides"
    >
      <div className="flex w-full max-w-[14rem] items-center gap-1.5 sm:max-w-[18rem] sm:gap-2 md:max-w-[20rem]">
        {Array.from({ length: count }, (_, index) => {
          const isActive = index === activeIndex;
          const isComplete = index < activeIndex;

          return (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={labels[index] ?? `Group ${index + 1}`}
              className="relative h-px flex-1 overflow-hidden bg-carousel-indicator focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow sm:h-0.5"
              onClick={() => onSelect(index)}
            >
              <span
                className="absolute inset-0 origin-left bg-carousel-indicator-active will-change-transform"
                style={{
                  transform: isActive
                    ? "scaleX(var(--carousel-progress, 0))"
                    : isComplete
                      ? "scaleX(1)"
                      : "scaleX(0)",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
