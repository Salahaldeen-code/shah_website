"use client";

import { Button, useConfig, useDocumentInfo, useTranslation } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Renders an Edit control beside Save in document controls.
 * Replaces the header Edit tab once API is hidden.
 */
export function EditBesideSave() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { id, collectionSlug, globalSlug } = useDocumentInfo();
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();

  const locale = searchParams.get("locale");
  const localeQuery = locale ? `?locale=${locale}` : "";

  let editPath = "";
  if (collectionSlug && id && id !== "create") {
    editPath = formatAdminURL({
      adminRoute,
      path: `/collections/${collectionSlug}/${id}`,
    });
  } else if (globalSlug) {
    editPath = formatAdminURL({
      adminRoute,
      path: `/globals/${globalSlug}`,
    });
  }

  if (!editPath) return null;

  const isOnEdit =
    pathname === editPath ||
    pathname === `${editPath}/` ||
    (!pathname.includes("/api") &&
      !pathname.includes("/versions") &&
      !pathname.includes("/preview") &&
      pathname.startsWith(editPath));

  return (
    <Button
      aria-label={t("general:edit")}
      buttonStyle="secondary"
      className="psr-edit-beside-save"
      disabled={isOnEdit}
      el={isOnEdit ? "div" : "link"}
      margin={false}
      size="medium"
      to={isOnEdit ? undefined : `${editPath}${localeQuery}`}
    >
      {t("general:edit")}
    </Button>
  );
}
