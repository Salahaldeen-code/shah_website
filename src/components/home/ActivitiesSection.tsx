import { ActivitiesStage } from "@/components/home/ActivitiesStage";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

/** Single homepage section: Activities cards → Join the Movement. */
export async function ActivitiesSection() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);

  return (
    <section
      id="activities"
      aria-labelledby="activities-heading"
      className="relative scroll-mt-24 bg-black text-white"
    >
      <ActivitiesStage copy={dictionary.activities} />
    </section>
  );
}
