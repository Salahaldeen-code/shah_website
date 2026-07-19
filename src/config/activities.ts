export type ActivitySlot = "topLeft" | "bottomRight";

export type ActivityTitleKey =
  | "mountainBiking"
  | "treePlanting"
  | "danceKids"
  | "aerialYoga";

export type ActivityTagKey = "outdoor" | "community" | "kids" | "wellness";

export type ActivityItem = {
  id: string;
  slot: ActivitySlot;
  titleKey: ActivityTitleKey;
  tagKey: ActivityTagKey;
  image: string;
  /** Short muted loop shown on hover over the photo. */
  video: string;
};

export type ActivityPair = {
  id: string;
  items: readonly [ActivityItem, ActivityItem];
};

export const activityPairs: readonly ActivityPair[] = [
  {
    id: "pair-a",
    items: [
      {
        id: "activity-biking",
        slot: "topLeft",
        titleKey: "mountainBiking",
        tagKey: "outdoor",
        image: "/images/hero/image5.jpg",
        video: "/videos/activities/outdoor.mp4",
      },
      {
        id: "activity-planting",
        slot: "bottomRight",
        titleKey: "treePlanting",
        tagKey: "community",
        image: "/images/hero/image6.jpg",
        video: "/videos/activities/outdoor.mp4",
      },
    ],
  },
  {
    id: "pair-b",
    items: [
      {
        id: "activity-dance",
        slot: "topLeft",
        titleKey: "danceKids",
        tagKey: "kids",
        image: "/images/hero/image1.jpg",
        video: "/videos/activities/outdoor.mp4",
      },
      {
        id: "activity-aerial",
        slot: "bottomRight",
        titleKey: "aerialYoga",
        tagKey: "wellness",
        image: "/images/hero/image3.jpg",
        video: "/videos/activities/outdoor.mp4",
      },
    ],
  },
] as const;

export const activityItems = activityPairs.flatMap((pair) => pair.items);

/** Athlete cutout for the membership act in the same Activities scene. */
export const activitiesMembershipImage =
  "/images/app/badminton-cutout.png" as const;
