"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { ProgramRecord } from "@/config/programs";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatScheduleLabel } from "@/lib/programs";

type ProgramDetailModalProps = {
  program: ProgramRecord;
  locale: Locale;
  copy: Dictionary["programs"];
  onClose: () => void;
};

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-5.4 7-11.2A7 7 0 1 0 5 9.8C5 15.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="9.5" r="2.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ProgramDetailModal({
  program,
  locale,
  copy,
  onClose,
}: ProgramDetailModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  const intlLocale = locale === "ms" ? "ms-MY" : "en-MY";
  const schedule = formatScheduleLabel(program.start, program.end, intlLocale);
  const description = copy.details?.[program.titleKey] ?? copy.subtitle;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="presentation"
    >
      {/* Full-viewport dim + blur — covers sticky yellow, nav, and everything above */}
      <button
        type="button"
        aria-label={copy.close}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="program-modal relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#121214] shadow-[0_24px_80px_rgb(0_0_0/0.7)]"
      >
        <div className="relative aspect-video w-full bg-brand-surface">
          <Image
            src={program.image}
            alt={copy.items[program.titleKey]}
            fill
            sizes="512px"
            className="object-cover"
            priority
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#121214] via-black/15 to-transparent"
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white transition hover:border-brand-yellow/50 hover:text-brand-yellow"
            aria-label={copy.close}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="px-5 pt-4 pb-6 sm:px-6 sm:pb-7">
          <p className="text-[0.6rem] tracking-[0.2em] text-white/55 uppercase">
            {copy.categories[program.categoryKey]}
          </p>
          <h3
            id={titleId}
            className="mt-1 font-display text-2xl tracking-[0.06em] text-brand-yellow uppercase sm:text-3xl"
          >
            {copy.items[program.titleKey]}
          </h3>

          <div className="mt-4 space-y-2.5 text-sm">
            <p className="inline-flex items-start gap-2.5 text-white/90">
              <CalendarIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
              <span>{schedule}</span>
            </p>
            <p className="inline-flex items-start gap-2.5 text-white/65">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" />
              <span>{copy.venues[program.venueKey]}</span>
            </p>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {description}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Link
              href="/membership"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-brand-yellow bg-brand-yellow px-6 py-3 text-sm font-semibold tracking-[0.14em] text-brand-dark uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-brand-yellow"
            >
              {copy.joinNow}
              <span aria-hidden="true">›</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm tracking-[0.14em] text-white/70 uppercase transition hover:border-white/40 hover:text-white"
            >
              {copy.close}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
