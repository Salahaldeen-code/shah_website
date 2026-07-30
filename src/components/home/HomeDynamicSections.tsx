"use client";

import dynamic from "next/dynamic";

import type { EditorialCopy } from "@/components/home/EditorialShowcase";
import type {
  GalleryReelCopy,
  GalleryReelImage,
} from "@/components/ui/3d-parallax-unfurling-gallery";
import type { Locale } from "@/config/i18n";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CmsProgram } from "@/lib/cms/programs";

function SectionSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`w-full bg-brand-dark ${className ?? "min-h-[50svh]"}`}
      aria-hidden
    />
  );
}

const EditorialShowcase = dynamic(
  () =>
    import("@/components/home/EditorialShowcase").then(
      (mod) => mod.EditorialShowcase,
    ),
  { loading: () => <SectionSkeleton /> },
);

const ScrollImpactSection = dynamic(
  () =>
    import("@/components/home/ScrollImpactSection").then(
      (mod) => mod.ScrollImpactSection,
    ),
  { loading: () => <SectionSkeleton className="min-h-svh" /> },
);

const ThreeDParallaxUnfurlingGallery = dynamic(
  () => import("@/components/ui/3d-parallax-unfurling-gallery"),
  {
    ssr: false,
    loading: () => <SectionSkeleton className="min-h-svh" />,
  },
);

export function DynamicEditorialShowcase(props: { copy: EditorialCopy }) {
  return <EditorialShowcase {...props} />;
}

export function DynamicScrollImpactSection(props: {
  copy: Dictionary["impact"];
  programsCopy: Dictionary["programs"];
  programs?: CmsProgram[];
  images?: {
    background: { src: string; alt: string };
    floatLeft: { src: string; alt: string };
    floatRight: { src: string; alt: string };
  } | null;
  locale: Locale;
}) {
  return <ScrollImpactSection {...props} />;
}

export function DynamicGallery(props: {
  copy?: GalleryReelCopy;
  images?: GalleryReelImage[];
}) {
  return <ThreeDParallaxUnfurlingGallery {...props} />;
}
