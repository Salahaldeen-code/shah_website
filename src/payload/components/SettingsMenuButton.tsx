"use client";

import { GearIcon, Popup, useTranslation } from "@payloadcms/ui";
import type { ReactNode } from "react";
import { Fragment } from "react";

const baseClass = "settings-menu-button";

type SettingsMenuButtonProps = {
  settingsMenu: ReactNode[];
};

export function SettingsMenuButton({ settingsMenu }: SettingsMenuButtonProps) {
  const { t } = useTranslation();

  if (!settingsMenu || settingsMenu.length === 0) {
    return null;
  }

  return (
    <Popup
      button={<GearIcon ariaLabel={t("general:menu")} />}
      className={baseClass}
      horizontalAlign="left"
      id="settings-menu"
      size="small"
      verticalAlign="bottom"
    >
      {settingsMenu.map((item, index) => (
        <Fragment key={`settings-menu-item-${index}`}>{item}</Fragment>
      ))}
    </Popup>
  );
}
