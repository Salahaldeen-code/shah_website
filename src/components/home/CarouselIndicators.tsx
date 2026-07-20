type CarouselIndicatorsProps = {
  count: number;
  activeIndex: number;
  progress: number;
  onSelect: (index: number) => void;
  labels: string[];
};

export function CarouselIndicators({
  count,
  activeIndex,
  progress,
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
          const fill = isActive ? progress : index < activeIndex ? 1 : 0;
          const clamped = Math.min(Math.max(fill, 0), 1);

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
                className="absolute inset-y-0 left-0 w-full origin-left bg-carousel-indicator-active will-change-transform"
                style={{ transform: `scaleX(${clamped})` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
