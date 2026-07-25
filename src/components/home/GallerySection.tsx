import ThreeDParallaxUnfurlingGallery from "@/components/ui/3d-parallax-unfurling-gallery";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

/** 3D parallax gallery — placed after Join the Movement. */
export async function GallerySection() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return <ThreeDParallaxUnfurlingGallery copy={dictionary.gallery.reel} />;
}
