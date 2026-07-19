import { ActiveLifeCollage } from "@/components/home/ActiveLifeCollage";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type ActiveLifeSectionProps = {
  copy: Dictionary["showcase"];
};

export function ActiveLifeSection({ copy }: ActiveLifeSectionProps) {
  return <ActiveLifeCollage copy={copy} />;
}
