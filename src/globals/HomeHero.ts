import type { GlobalConfig } from "payload";

import {
  homePreviews,
  sectionPreviewField,
} from "../payload/admin/sectionPreview.ts";
import { revalidateGlobals } from "../hooks/revalidateContent.ts";

export const HomeHero: GlobalConfig = {
  slug: "home-hero",
  label: "Hero Carousel",
  admin: {
    group: "Home",
    description:
      "Top of homepage — shutter carousel (slides/images are in code for now)",
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobals],
  },
  fields: [
    sectionPreviewField(
      homePreviews.heroCarousel,
      "Hero carousel with shutter bars",
      "This is the first section visitors see. Slide images live in src/config/carousel.ts (CMS copy for hero coming in a later phase).",
    ),
  ],
};
