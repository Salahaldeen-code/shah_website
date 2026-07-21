"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

import { ProgramDetailModal } from "@/components/home/ProgramDetailModal";
import {
  programs,
  type ProgramCategoryKey,
  type ProgramRecord,
} from "@/config/programs";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatScheduleLabel, getUpcomingPrograms } from "@/lib/programs";

type UpcomingProgramsTableProps = {
  locale: Locale;
  copy: Dictionary["programs"];
  className?: string;
  style?: CSSProperties;
};

type FilterKey = "all" | "team" | "racket" | "fitness" | "aquatic";

const FILTERS: FilterKey[] = ["all", "team", "racket", "fitness", "aquatic"];
/** Always reserve space for this many rows so filters don’t shrink the table. */
const LIST_SLOTS = 4;

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 21s7-5.4 7-11.2A7 7 0 1 0 5 9.8C5 15.6 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="9.5"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function UpcomingProgramsTable({
  locale,
  copy,
  className = "",
  style,
}: UpcomingProgramsTableProps) {
  const intlLocale = locale === "ms" ? "ms-MY" : "en-MY";
  const [filter, setFilter] = useState<FilterKey>("all");
  const [showAll, setShowAll] = useState(false);
  const [selected, setSelected] = useState<ProgramRecord | null>(null);

  const allUpcoming = getUpcomingPrograms(programs);
  const upcoming = allUpcoming.filter((program) => {
    if (filter === "all") return true;
    return program.categoryKey === (filter as ProgramCategoryKey);
  });
  const visiblePrograms = showAll ? upcoming : upcoming.slice(0, LIST_SLOTS);
  const canExpand = allUpcoming.length > LIST_SLOTS;

  return (
    <div
      className={`programs-overlay text-white ${className}`.trim()}
      style={style}
    >
      <div className="mx-auto w-full max-w-[var(--container-max)] px-[var(--container-padding)] pt-6 pb-[calc(var(--content-bottom-pad)+0.5rem)] sm:pt-10 sm:pb-[calc(var(--content-bottom-pad)+0.75rem)]">
        <div className="programs-glass px-3 py-5 sm:px-7 sm:py-8 md:px-9 md:py-9">
          <header className="mb-4 text-center sm:mb-6">
            <p className="text-[0.65rem] tracking-[0.32em] text-brand-yellow uppercase">
              PSR
            </p>
            <h3 className="mt-1.5 font-display text-xl tracking-[0.1em] text-brand-yellow uppercase sm:text-3xl md:text-[2.35rem]">
              {copy.title}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-white/70">
              {copy.subtitle}
            </p>
          </header>

          <div
            role="tablist"
            aria-label={copy.title}
            className="mb-5 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mb-6 sm:flex-wrap sm:items-center sm:justify-center sm:gap-2 sm:overflow-visible [&::-webkit-scrollbar]:hidden"
          >
            {FILTERS.map((key) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`programs-filter shrink-0 rounded-full px-3 py-1.5 text-[0.55rem] tracking-[0.14em] uppercase sm:px-4 sm:text-[0.62rem] ${
                    active ? "programs-filter-active" : ""
                  }`}
                  onClick={() => {
                    setFilter(key);
                    setShowAll(false);
                  }}
                >
                  {copy.filters[key]}
                </button>
              );
            })}
          </div>

          <ul
            className={`programs-table-shell rounded-xl border border-white/10 ${
              showAll ? "programs-table-shell-expanded" : "overflow-hidden"
            }`}
          >
            {visiblePrograms.length === 0 ? (
              <li className="flex h-full min-h-[inherit] items-center justify-center px-4 py-8 text-center text-sm text-white/55">
                {copy.empty}
              </li>
            ) : (
              visiblePrograms.map((program, index) => {
                const schedule = formatScheduleLabel(
                  program.start,
                  program.end,
                  intlLocale,
                );

                return (
                  <li key={program.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(program)}
                      className="programs-row programs-row-glass group grid w-full cursor-pointer grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-x-3 gap-y-2.5 px-3 py-3 text-left sm:h-[6rem] sm:grid-cols-[4.75rem_minmax(0,1.2fr)_minmax(0,1.1fr)_auto] sm:items-center sm:gap-5 sm:px-4 sm:py-0"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <div className="relative aspect-square w-full overflow-hidden rounded-md bg-brand-surface sm:aspect-4/3">
                        <Image
                          src={program.image}
                          alt={copy.items[program.titleKey]}
                          fill
                          sizes="76px"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                        />
                      </div>

                      <div className="min-w-0 self-center">
                        <p className="text-[0.55rem] tracking-[0.18em] text-white/55 uppercase">
                          {copy.categories[program.categoryKey]}
                        </p>
                        <p className="mt-0.5 truncate font-display text-[0.95rem] tracking-[0.05em] text-brand-yellow uppercase sm:text-lg">
                          {copy.items[program.titleKey]}
                        </p>
                        <div className="mt-1.5 flex flex-col gap-1 text-[0.68rem] text-white/60 sm:hidden">
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <CalendarIcon className="h-3 w-3 shrink-0 text-brand-yellow/80" />
                            <span className="truncate">{schedule}</span>
                          </span>
                          <span className="inline-flex min-w-0 items-center gap-1.5">
                            <PinIcon className="h-3 w-3 shrink-0 text-brand-yellow/80" />
                            <span className="truncate">
                              {copy.venues[program.venueKey]}
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 hidden min-w-0 flex-col gap-1.5 sm:col-span-1 sm:flex">
                        <p className="inline-flex items-center gap-2 text-sm text-white/85">
                          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-brand-yellow/85" />
                          <span className="truncate tabular-nums">
                            {schedule}
                          </span>
                        </p>
                        <p className="inline-flex items-center gap-2 text-xs text-white/55">
                          <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand-yellow/70" />
                          <span className="truncate">
                            {copy.venues[program.venueKey]}
                          </span>
                        </p>
                      </div>

                      <div className="col-span-2 flex sm:col-span-1 sm:justify-end">
                        <span className="inline-flex w-full shrink-0 items-center justify-center gap-1.5 rounded-full border border-brand-yellow bg-brand-yellow px-3 py-2 text-[0.58rem] font-semibold tracking-[0.12em] text-brand-dark uppercase transition-[background-color,color,transform] duration-300 group-hover:-translate-y-0.5 sm:w-auto sm:px-5 sm:py-2.5 sm:text-[0.68rem]">
                          {copy.join}
                          <span aria-hidden="true">›</span>
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {canExpand || showAll ? (
            <div className="mt-5 flex justify-center sm:mt-6">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 border border-brand-yellow bg-transparent px-7 py-2.5 font-display text-[0.68rem] tracking-[0.16em] text-brand-yellow uppercase transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-brand-yellow hover:text-brand-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                onClick={() => {
                  if (showAll) {
                    setShowAll(false);
                    return;
                  }
                  setFilter("all");
                  setShowAll(true);
                }}
              >
                {showAll ? copy.showLess : copy.viewAll}
                <span aria-hidden="true">{showAll ? "‹" : "›"}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {selected ? (
        <ProgramDetailModal
          program={selected}
          locale={locale}
          copy={copy}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
