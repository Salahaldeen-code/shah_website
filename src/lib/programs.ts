import type { ProgramRecord } from "@/config/programs";

/** Upcoming programs sorted soonest-first (includes events starting today). */
export function getUpcomingPrograms(
  records: ProgramRecord[],
  now = new Date(),
): ProgramRecord[] {
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  return [...records]
    .filter((program) => new Date(program.start).getTime() >= startOfToday)
    .sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    );
}

export function formatTimeRange(
  startIso: string,
  endIso: string,
  locale: string,
): string {
  const start = new Date(startIso);
  const end = new Date(endIso);
  const opts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };
  return `${start.toLocaleTimeString(locale, opts)} – ${end.toLocaleTimeString(locale, opts)}`;
}

/** Reference-style schedule label: `19 Jul (Sun), 9:00 am – 11:00 am` */
export function formatScheduleLabel(
  startIso: string,
  endIso: string,
  locale: string,
): string {
  const start = new Date(startIso);
  const day = start.toLocaleDateString(locale, { day: "numeric" });
  const month = start.toLocaleDateString(locale, { month: "short" });
  const weekday = start.toLocaleDateString(locale, { weekday: "short" });
  const time = formatTimeRange(startIso, endIso, locale);
  return `${day} ${month} (${weekday}), ${time}`;
}
