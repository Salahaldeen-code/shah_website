import ThreeDParallaxUnfurlingGallery from "@/components/ui/3d-parallax-unfurling-gallery";
import {
  collectActivityReelImages,
  getCmsActivities,
  getCmsGalleryUi,
} from "@/lib/cms";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

/** 3D parallax gallery — activity photos, shuffled. */
export async function GallerySection() {
  const locale = await getLocale();
  const [dictionary, activities, galleryUi] = await Promise.all([
    getDictionary(locale),
    getCmsActivities(locale),
    getCmsGalleryUi(locale),
  ]);

  const images = collectActivityReelImages(activities.items);
  const reelCopy = {
    ...dictionary.gallery.reel,
    title: galleryUi.title || dictionary.gallery.reel.title,
    subtitle: galleryUi.subtitle || dictionary.gallery.reel.subtitle,
  };

  return (
    <ThreeDParallaxUnfurlingGallery copy={reelCopy} images={images} />
  );
}
