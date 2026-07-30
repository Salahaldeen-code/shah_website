/** @deprecated use navLabels.ts */
import { NAV_GROUP_ORDER, navEntityOrder } from "./navLabels.ts";

export { NAV_GROUP_ORDER, navEntityOrder };

export type NavGroupLabel = (typeof NAV_GROUP_ORDER)[number];

/** @deprecated use NAV_GROUP_ORDER[0] */
export const HOME_GROUP = "Home";

/** @deprecated use navEntityOrder */
export const homeNavOrder = navEntityOrder;
