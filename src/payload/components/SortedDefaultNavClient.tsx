"use client";

import { DefaultNavClient } from "@payloadcms/next/client";
import type { NavPreferences } from "payload";
import type { NavGroupType } from "@payloadcms/ui/shared";
import { useMemo } from "react";

import { sortNavGroups } from "../admin/sortNavGroups.ts";

type SortedDefaultNavClientProps = {
  groups: NavGroupType[];
  navPreferences: NavPreferences;
};

export function SortedDefaultNavClient({
  groups,
  navPreferences,
}: SortedDefaultNavClientProps) {
  const sortedGroups = useMemo(() => sortNavGroups(groups), [groups]);

  return (
    <DefaultNavClient groups={sortedGroups} navPreferences={navPreferences} />
  );
}
