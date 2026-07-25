import { ActivitiesStage } from "@/components/home/ActivitiesStage";
import { getCmsActivities } from "@/lib/cms";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/locale";

/** Single homepage section: Activities cards → Join the Movement. */
export async function ActivitiesSection() {
  const locale = await getLocale();
  const [dictionary, activities] = await Promise.all([
    getDictionary(locale),
    getCmsActivities(locale),
  ]);

  return (
    <section
      id="activities"
      aria-labelledby="activities-heading"
      className="relative scroll-mt-24 bg-black text-white"
    >
      <ActivitiesStage
        copy={{
          title: activities.ui.title,
          description: activities.ui.description,
          items: {
            ...dictionary.activities.items,
            ...Object.fromEntries(
              activities.items.map((item) => [item.titleKey, item.title]),
            ),
          },
          tags: dictionary.activities.tags,
          membership: {
            titleLine1: activities.ui.membership.titleLine1,
            titleLine2: activities.ui.membership.titleLine2,
            description: activities.ui.membership.description,
            joinCta: activities.ui.membership.joinCta,
            imageAlt: activities.ui.membership.imageAlt,
          },
        }}
        items={activities.items}
        pairs={activities.pairs}
        membershipImage={activities.ui.membership.image}
      />
    </section>
  );
}
