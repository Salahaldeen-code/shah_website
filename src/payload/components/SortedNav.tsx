import { Logout } from "@payloadcms/ui";
import { RenderServerComponent } from "@payloadcms/ui/elements/RenderServerComponent";
import {
  EntityType,
  groupNavItems,
  type EntityToGroup,
} from "@payloadcms/ui/shared";
import { NavHamburger, NavWrapper } from "@payloadcms/next/client";
import type { NavPreferences, PayloadRequest, ServerProps } from "payload";
import React from "react";

import { SettingsMenuButton } from "./SettingsMenuButton.tsx";
import { SortedDefaultNavClient } from "./SortedDefaultNavClient.tsx";

const baseClass = "nav";

type NavProps = {
  req?: PayloadRequest;
} & ServerProps;

/** Skip payload-preferences DB hit on every admin navigation. */
const defaultNavPreferences = { groups: {} } as NavPreferences;

export const SortedNav: React.FC<NavProps> = async (props) => {
  const {
    documentSubViewType,
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
    viewType,
    visibleEntities,
  } = props;

  if (!payload?.config) {
    return null;
  }

  const {
    admin: {
      components: {
        afterNav,
        afterNavLinks,
        beforeNav,
        beforeNavLinks,
        logout,
        settingsMenu,
      },
    },
    collections,
    globals,
  } = payload.config;

  if (!visibleEntities || !permissions) {
    return null;
  }

  const entities: EntityToGroup[] = [
    ...collections
      .filter(({ slug }) => visibleEntities.collections.includes(slug))
      .map(
        (collection): EntityToGroup => ({
          type: EntityType.collection,
          entity: collection,
        }),
      ),
    ...globals
      .filter(({ slug }) => visibleEntities.globals.includes(slug))
      .map(
        (global): EntityToGroup => ({
          type: EntityType.global,
          entity: global,
        }),
      ),
  ];

  const groups = groupNavItems(entities, permissions, i18n);

  const serverProps = {
    i18n,
    locale,
    params,
    payload,
    permissions,
    searchParams,
    user,
  };

  const clientProps = {
    documentSubViewType,
    viewType,
  };

  const LogoutComponent = RenderServerComponent({
    clientProps,
    Component: logout?.Button,
    Fallback: Logout,
    importMap: payload.importMap,
    serverProps,
  });

  const RenderedSettingsMenu =
    settingsMenu && Array.isArray(settingsMenu)
      ? settingsMenu.map((item, index) =>
          RenderServerComponent({
            clientProps,
            Component: item,
            importMap: payload.importMap,
            key: `settings-menu-item-${index}`,
            serverProps,
          }),
        )
      : [];

  const RenderedBeforeNav = RenderServerComponent({
    clientProps,
    Component: beforeNav,
    importMap: payload.importMap,
    serverProps,
  });

  const RenderedBeforeNavLinks = RenderServerComponent({
    clientProps,
    Component: beforeNavLinks,
    importMap: payload.importMap,
    serverProps,
  });

  const RenderedAfterNavLinks = RenderServerComponent({
    clientProps,
    Component: afterNavLinks,
    importMap: payload.importMap,
    serverProps,
  });

  const RenderedAfterNav = RenderServerComponent({
    clientProps,
    Component: afterNav,
    importMap: payload.importMap,
    serverProps,
  });

  return (
    <NavWrapper baseClass={baseClass}>
      {RenderedBeforeNav}
      <nav className={`${baseClass}__wrap`}>
        {RenderedBeforeNavLinks}
        <SortedDefaultNavClient
          groups={groups}
          navPreferences={defaultNavPreferences}
        />
        {RenderedAfterNavLinks}
        <div className={`${baseClass}__controls`}>
          <SettingsMenuButton settingsMenu={RenderedSettingsMenu} />
          {LogoutComponent}
        </div>
      </nav>
      {RenderedAfterNav}
      <div className={`${baseClass}__header`}>
        <div className={`${baseClass}__header-content`}>
          <NavHamburger baseClass={baseClass} />
        </div>
      </div>
    </NavWrapper>
  );
};
