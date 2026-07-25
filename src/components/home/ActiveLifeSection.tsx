import { ActiveLifeCollage } from "@/components/home/ActiveLifeCollage";
import { getCmsShowcase } from "@/lib/cms";
import { getLocale } from "@/lib/i18n/locale";

export async function ActiveLifeSection() {
  const locale = await getLocale();
  const showcase = await getCmsShowcase(locale);

  return (
    <ActiveLifeCollage
      copy={showcase.copy}
      sideImages={showcase.sideImages}
      gridImages={showcase.gridImages}
    />
  );
}
