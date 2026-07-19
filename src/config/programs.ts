export type ProgramTitleKey =
  | "football"
  | "tennis"
  | "fitness"
  | "swimming"
  | "badminton"
  | "yoga"
  | "kidsAthletics"
  | "hiking";

export type ProgramCategoryKey =
  | "team"
  | "racket"
  | "fitness"
  | "aquatic"
  | "outdoor"
  | "youth";

export type ProgramVenueKey =
  | "mainField"
  | "courtA"
  | "studio"
  | "pool"
  | "hall"
  | "trailHead";

export type ProgramRecord = {
  id: string;
  titleKey: ProgramTitleKey;
  categoryKey: ProgramCategoryKey;
  venueKey: ProgramVenueKey;
  image: string;
  start: string;
  end: string;
};

function onMonthDay(day: number, hour: number, minute = 0, durationHours = 1.5) {
  const now = new Date();
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    day,
    hour,
    minute,
    0,
    0,
  );
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
  return { start: start.toISOString(), end: end.toISOString() };
}

/** Sample programs for the current calendar month (regenerated at module load). */
function buildSamplePrograms(): ProgramRecord[] {
  const today = new Date().getDate();
  const lastDay = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0,
  ).getDate();

  const day = (...candidates: number[]) =>
    candidates.find((d) => d >= 1 && d <= lastDay) ?? Math.min(today, lastDay);

  return [
    {
      id: "prog-football",
      titleKey: "football",
      categoryKey: "team",
      venueKey: "mainField",
      image: "/images/hero/image2.jpg",
      ...onMonthDay(day(today, 3, 10), 9, 0, 2),
    },
    {
      id: "prog-tennis",
      titleKey: "tennis",
      categoryKey: "racket",
      venueKey: "courtA",
      image: "/images/hero/image3.jpg",
      ...onMonthDay(day(today + 1, 5, 12), 17, 0, 1.5),
    },
    {
      id: "prog-fitness",
      titleKey: "fitness",
      categoryKey: "fitness",
      venueKey: "studio",
      image: "/images/hero/image6.jpg",
      ...onMonthDay(day(today + 2, 7, 14), 7, 30, 1),
    },
    {
      id: "prog-swimming",
      titleKey: "swimming",
      categoryKey: "aquatic",
      venueKey: "pool",
      image: "/images/hero/image4.jpg",
      ...onMonthDay(day(today + 3, 8, 16), 18, 0, 1.5),
    },
    {
      id: "prog-badminton",
      titleKey: "badminton",
      categoryKey: "racket",
      venueKey: "hall",
      image: "/images/hero/image6.jpg",
      ...onMonthDay(day(today + 5, 11, 18), 19, 0, 2),
    },
    {
      id: "prog-yoga",
      titleKey: "yoga",
      categoryKey: "fitness",
      venueKey: "studio",
      image: "/images/hero/image5.jpg",
      ...onMonthDay(day(today + 6, 13, 20), 8, 0, 1),
    },
    {
      id: "prog-kids",
      titleKey: "kidsAthletics",
      categoryKey: "youth",
      venueKey: "mainField",
      image: "/images/hero/image1.jpg",
      ...onMonthDay(day(today + 8, 15, 22), 10, 0, 1.5),
    },
    {
      id: "prog-hiking",
      titleKey: "hiking",
      categoryKey: "outdoor",
      venueKey: "trailHead",
      image: "/images/hero/image5.jpg",
      ...onMonthDay(day(Math.min(today + 10, lastDay), 21, lastDay), 7, 0, 3),
    },
  ];
}

export const programs: ProgramRecord[] = buildSamplePrograms();
