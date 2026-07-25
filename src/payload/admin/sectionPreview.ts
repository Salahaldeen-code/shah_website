import type { Field } from "payload";

const previewBase = "/cms-previews/home";

/** Read-only homepage screenshot shown at the top of a CMS section edit form. */
export function sectionPreviewField(
  image: string,
  alt: string,
  hint?: string,
): Field {
  return {
    name: "_sectionPreview",
    type: "ui",
    admin: {
      disableListColumn: true,
      components: {
        Field: "@/payload/components/SectionPreviewField#SectionPreviewField",
      },
      custom: {
        src: `${previewBase}/${image}`,
        alt,
        hint,
      },
    },
  };
}

export const homePreviews = {
  heroCarousel: "hero-carousel.png",
  editorialShowcase: "editorial-showcase.png",
  activeLifeIntro: "active-life-intro.png",
  activeLifeGrid: "active-life-grid.png",
  impact: "impact-section.png",
  programs: "programs-section.png",
  activitiesCards: "activities-cards.png",
  joinMovement: "join-movement.png",
  socialFooter: "social-footer.png",
  footerLegal: "footer-legal.png",
} as const;
