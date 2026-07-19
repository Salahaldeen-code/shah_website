import Image from "next/image";
import Link from "next/link";

import TeamShowcase from "@/components/ui/team-showcase";
import { committeeMembers } from "@/config/committee";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type AboutPageContentProps = {
  copy: Dictionary["aboutPage"];
};

const pillarKeys = ["community", "access", "active"] as const;

export function AboutPageContent({ copy }: AboutPageContentProps) {
  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/image5.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-dark/85 to-brand-dark"
          />
        </div>

        <div className="relative mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] pt-16 pb-14 sm:pt-20 sm:pb-16 md:pt-24 md:pb-20">
          <p className="text-[0.7rem] tracking-[0.28em] text-brand-yellow uppercase">
            {copy.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.92] tracking-[0.04em] text-brand-yellow uppercase">
            {copy.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
            {copy.lead}
          </p>
        </div>
      </section>

      {/* Story + mission / vision */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-14 sm:py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <h2 className="font-display text-3xl tracking-[0.08em] text-brand-yellow uppercase sm:text-4xl">
              {copy.storyTitle}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70">
              {copy.story}
            </p>
            <div className="relative mt-8 aspect-[16/10] overflow-hidden bg-brand-surface">
              <Image
                src="/images/hero/image6.jpg"
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <article className="border border-brand-yellow/30 bg-white/[0.03] p-6 sm:p-7">
              <h3 className="font-display text-xl tracking-[0.1em] text-brand-yellow uppercase">
                {copy.missionTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                {copy.mission}
              </p>
            </article>
            <article className="border border-white/12 bg-white/[0.03] p-6 sm:p-7">
              <h3 className="font-display text-xl tracking-[0.1em] text-white uppercase">
                {copy.visionTitle}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70 sm:text-base">
                {copy.vision}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Committee organization chart */}
      <section
        id="committee"
        aria-labelledby="committee-heading"
        className="border-t border-white/10"
      >
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-14 sm:py-16 md:py-20">
          <div className="mb-8 text-center sm:mb-10">
            <h2
              id="committee-heading"
              className="font-display text-3xl tracking-[0.08em] text-brand-yellow uppercase sm:text-4xl"
            >
              {copy.committeeTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
              {copy.committeeSubtitle}
            </p>
          </div>
          <TeamShowcase members={committeeMembers} />
        </div>
      </section>

      {/* Pillars */}
      <section className="border-y border-white/10 bg-black/40">
        <div className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-14 sm:py-16">
          <h2 className="text-center font-display text-3xl tracking-[0.08em] text-brand-yellow uppercase sm:text-4xl">
            {copy.pillarsTitle}
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {pillarKeys.map((key) => (
              <li
                key={key}
                className="border border-white/10 bg-white/[0.03] px-5 py-6"
              >
                <span
                  aria-hidden="true"
                  className="mb-4 block h-1 w-8 bg-brand-yellow"
                />
                <h3 className="font-display text-lg tracking-[0.08em] text-white uppercase">
                  {copy.pillars[key].title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {copy.pillars[key].body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-14 sm:py-16 md:py-20">
        <div className="border border-brand-yellow/40 bg-gradient-to-br from-brand-yellow/10 to-transparent px-6 py-10 text-center sm:px-10 sm:py-12">
          <h2 className="font-display text-3xl tracking-[0.08em] text-brand-yellow uppercase sm:text-4xl">
            {copy.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            {copy.ctaBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center border border-brand-yellow bg-brand-yellow px-7 py-3 font-display text-sm tracking-[0.16em] text-brand-dark uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow"
            >
              {copy.ctaMembership}
            </Link>
            <Link
              href="/#activities"
              className="inline-flex items-center justify-center border border-white/25 bg-transparent px-7 py-3 font-display text-sm tracking-[0.16em] text-white uppercase transition-[border-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-brand-yellow hover:text-brand-yellow"
            >
              {copy.ctaActivities}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
