export type ImpactImage = {
  id: string;
  src: string;
  alt: string;
};

export const impactImages = {
  background: {
    id: "impact-bg",
    src: "/images/app/impact-triathlon.png",
    alt: "Athletes running and cycling at sunrise with water reflections",
  },
  floatLeft: {
    id: "impact-float-left",
    src: "/images/hero/image1.jpg",
    alt: "Athlete in action",
  },
  floatRight: {
    id: "impact-float-right",
    src: "/images/hero/image3.jpg",
    alt: "Tennis player serving",
  },
} as const satisfies Record<"background" | "floatLeft" | "floatRight", ImpactImage>;
