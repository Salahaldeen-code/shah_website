export type ShowcaseImage = {
  id: string;
  src: string;
  alt: string;
};

/** Side images flanking the brand title (left stack, right stack). */
export const showcaseSideImages = {
  left: [
    {
      id: "side-l1",
      src: "/images/hero/image1.jpg",
      alt: "Athlete sprinting on the track",
    },
    {
      id: "side-l2",
      src: "/images/hero/image2.jpg",
      alt: "Football action on the field",
    },
  ],
  right: [
    {
      id: "side-r1",
      src: "/images/hero/image3.jpg",
      alt: "Tennis player serving",
    },
    {
      id: "side-r2",
      src: "/images/hero/image4.jpg",
      alt: "Synchronized swimming performance",
    },
  ],
} as const satisfies Record<"left" | "right", readonly ShowcaseImage[]>;

/** Main activity grid under the brand title — real activity photos only. */
export const showcaseGridImages: readonly ShowcaseImage[] = [
  {
    id: "grid-1",
    src: "/images/hero/image5.jpg",
    alt: "Beach volleyball match",
  },
  {
    id: "grid-2",
    src: "/images/hero/image6.jpg",
    alt: "Outdoor racket sports on the field",
  },
  {
    id: "grid-3",
    src: "/images/hero/image1.jpg",
    alt: "Track and field sprint start",
  },
  {
    id: "grid-4",
    src: "/images/hero/image2.jpg",
    alt: "Football celebration on the pitch",
  },
  {
    id: "grid-5",
    src: "/images/hero/image3.jpg",
    alt: "Tennis player serving",
  },
  {
    id: "grid-6",
    src: "/images/hero/image4.jpg",
    alt: "Aquatic sports performance",
  },
];
