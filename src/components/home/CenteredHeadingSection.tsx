type CenteredHeadingSectionProps = {
  heading: string;
  id?: string;
};

export function CenteredHeadingSection({
  heading,
  id = "intro",
}: CenteredHeadingSectionProps) {
  return (
    <section
      id={id}
      className="flex min-h-[40vh] items-center justify-center px-[var(--container-padding)] py-20 sm:min-h-[44vh] sm:py-24 md:py-28"
    >
      <h2 className="max-w-4xl text-center font-display text-4xl leading-none tracking-[0.04em] text-brand-yellow uppercase sm:text-5xl md:text-6xl lg:text-7xl">
        {heading}
      </h2>
    </section>
  );
}
