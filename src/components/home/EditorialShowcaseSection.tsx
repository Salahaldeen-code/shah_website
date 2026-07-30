import { DynamicEditorialShowcase } from "@/components/home/HomeDynamicSections";
import { getCmsEditorial } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

/** Home → TRAIN / COMPETE / EVOLVE stepped showcase (CMS copy). */
export async function EditorialShowcaseSection() {
  const locale = await getLocale();
  const copy = await getCmsEditorial(locale);

  return <DynamicEditorialShowcase copy={copy} />;
}
