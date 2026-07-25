"use client";

import type { DefaultCellComponentProps } from "payload";
import { Button, toast, useConfig } from "@payloadcms/ui";
import { formatAdminURL } from "payload/shared";
import { useRouter } from "next/navigation.js";
import { useState, useTransition } from "react";

export function ListRowActions(props: DefaultCellComponentProps) {
  const { collectionSlug, rowData } = props;
  const id = rowData?.id;
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const {
    config: {
      routes: { admin: adminRoute, api },
      serverURL,
    },
  } = useConfig();

  if (id == null) return null;

  const editHref = formatAdminURL({
    adminRoute,
    path: `/collections/${collectionSlug}/${id}`,
  });

  const onDelete = async () => {
    const title = String(rowData?.title ?? "this item");
    const confirmed = window.confirm(
      `Delete “${title}”? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`${serverURL}${api}/${collectionSlug}/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Delete failed (${res.status})`);
      }

      toast.success("Deleted");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="psr-list-row-actions"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <Button
        buttonStyle="secondary"
        el="link"
        margin={false}
        size="small"
        to={editHref}
      >
        Edit
      </Button>
      <Button
        buttonStyle="error"
        disabled={pending || deleting}
        margin={false}
        onClick={onDelete}
        size="small"
      >
        {deleting ? "…" : "Delete"}
      </Button>
    </div>
  );
}
