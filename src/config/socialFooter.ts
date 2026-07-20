/**
 * Social footer — links, circle layout, motion, and copy.
 * Edit this file to change social URLs, images, sizes, positions, and animation.
 */

export type SocialCircleItem = {
  /** Short label shown on the circle (e.g. IG) */
  label: string;
  /** Full platform name for accessible labels */
  name: string;
  /** Destination URL — leave empty for placeholder `#` */
  href: string;
  /** Images cycled while the circle is active */
  images: readonly string[];
  /** Unique id for interaction state */
  id: string;
  /** Base diameter in px at the desktop reference width (1280px) */
  sizePx: number;
  /**
   * Default position inside the desktop/tablet stage (% of stage width/height).
   * Circle top-left corner anchor.
   */
  position: { left: number; top: number };
  /** Default stacking order when no circle is active */
  zIndex: number;
  /** Grid order on mobile (0–3) */
  mobileOrder: number;
  /** Vertical stagger offset on mobile grid (px) */
  mobileStaggerPx: number;
};

export const socialFooterConfig = {
  colors: {
    background: "#f5c518",
    text: "#0a0a0a",
    divider: "#0a0a0a",
    circleLabel: "#ffffff",
    activeOutline: "#ffffff",
  },

  /** Large heading below the circle cluster */
  heading: "FOLLOW ALONG ON OUR SOCIAL CHANNELS",

  /** Bottom information row */
  bottom: {
    links: [
      { label: "Privacy Policy", href: "#privacy" },
      { label: "Terms of Use", href: "#terms" },
    ],
    /** Optional partner / logo strip — set to null to hide */
   
    copyright: "© Placeholder Organization",
    madeBy: "Site by Alogza",
  },

  /**
   * Motion & interaction — all durations in ms unless noted.
   */
  animation: {
    /** Scale multiplier when a circle is active */
    activeScale: 1.2,
    /** White ring width in px when active (0 to disable) */
    activeOutlinePx: 3,
    /** Circle transform duration */
    transitionDurationMs: 520,
    /** CSS easing for circle transforms */
    transitionEasing: "cubic-bezier(0.22, 1, 0.36, 1)",
    /** How far inactive circles shift away from the active one (px) */
    repulsionPx: {
      desktop: 52,
      tablet: 36,
      mobile: 0,
    },
    /** Interval between image changes while active */
    imageIntervalMs: 650,
    /** Crossfade duration between images */
    imageTransitionMs: 480,
  },

  /** Stage min-heights per breakpoint (px) */
  stageMinHeight: {
    desktop: 420,
    tablet: 380,
    mobile: 0,
  },

  socialItems: [
    {
      id: "ig",
      label: "IG",
      name: "Instagram",
      href: "",
      images: [
        "/images/hero/image1.jpg",
        "/images/hero/image2.jpg",
      ],
      sizePx: 295,
      position: { left: 3, top: 6 },
      zIndex: 2,
      mobileOrder: 0,
      mobileStaggerPx: 0,
    },
    {
      id: "fb",
      label: "FB",
      name: "Facebook",
      href: "",
      images: [
        "/images/hero/image3.jpg",
        "/images/hero/image4.jpg",
      ],
      sizePx: 310,
      position: { left: 26, top: 32 },
      zIndex: 1,
      mobileOrder: 2,
      mobileStaggerPx: 14,
    },
    {
      id: "yt",
      label: "YT",
      name: "YouTube",
      href: "",
      images: [
        "/images/hero/image5.jpg",
        "/images/hero/image6.jpg",
      ],
      sizePx: 335,
      position: { left: 50, top: 0 },
      zIndex: 3,
      mobileOrder: 1,
      mobileStaggerPx: -8,
    },
    {
      id: "tk",
      label: "TK",
      name: "TikTok",
      href: "",
      images: [
        "/images/hero/slide-1.png",
        "/images/hero/slide-2.png",
      ],
      sizePx: 295,
      position: { left: 73, top: 26 },
      zIndex: 2,
      mobileOrder: 3,
      mobileStaggerPx: 10,
    },
  ] satisfies readonly SocialCircleItem[],
} as const;

export type SocialFooterConfig = typeof socialFooterConfig;
