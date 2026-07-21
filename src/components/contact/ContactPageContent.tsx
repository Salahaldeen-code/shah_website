import Image from "next/image";

import { ContactForm } from "@/components/contact/ContactForm";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ContactPageContentProps = {
  copy: Dictionary["contactPage"];
};

export function ContactPageContent({ copy }: ContactPageContentProps) {
  return (
    <div className="relative">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <Image
            src="/images/hero/image3.jpg"
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

      <section className="mx-auto max-w-[var(--container-max)] px-[var(--container-padding)] py-14 sm:py-16 md:py-20">
        <div className="mb-8 max-w-xl lg:mb-10">
          <h2 className="font-display text-2xl tracking-[0.08em] text-brand-yellow uppercase sm:text-3xl">
            {copy.detailsTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            {copy.detailsLead}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-stretch lg:gap-12">
          <div className="relative h-full min-h-[16rem] overflow-hidden bg-brand-surface sm:min-h-[20rem] lg:min-h-0">
            <Image
              src="/images/app/contact.jpg"
              alt={copy.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>

          <ContactForm copy={copy.form} />
        </div>
      </section>
    </div>
  );
}
