import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa6";

import type { SocialCircleItem } from "@/config/socialFooter";

const iconMap = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  tiktok: FaTiktok,
} as const;

type SocialBrandIconProps = {
  icon: SocialCircleItem["icon"];
  className?: string;
  size?: number;
};

export function SocialBrandIcon({
  icon,
  className,
  size = 22,
}: SocialBrandIconProps) {
  const Icon = iconMap[icon];
  return <Icon aria-hidden className={className} size={size} />;
}
